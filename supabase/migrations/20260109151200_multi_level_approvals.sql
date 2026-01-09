-- Migration: Add multi-level approval system
-- Adds approval_level enum, approval_history table, and multi-level approval fields

-- Create enum for approval levels
CREATE TYPE public.approval_level AS ENUM (
  'pending_faculty',
  'pending_hod', 
  'pending_director',
  'approved',
  'rejected'
);

-- Add approval level and multi-level approval fields to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS approval_level approval_level DEFAULT 'pending_faculty',
ADD COLUMN IF NOT EXISTS approved_by_faculty UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at_faculty TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by_hod UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at_hod TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by_director UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at_director TIMESTAMPTZ;

-- Create approval_history table to track all approval actions
CREATE TABLE IF NOT EXISTS public.approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'escalated')),
  from_level approval_level,
  to_level approval_level,
  performed_by UUID REFERENCES auth.users(id) NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on approval_history
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Policies for approval_history
CREATE POLICY "Staff can view approval history"
  ON public.approval_history FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR 
         EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid()));

CREATE POLICY "Staff can insert approval history"
  ON public.approval_history FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- Update existing pending events to use new approval_level
UPDATE public.events 
SET approval_level = 'pending_faculty' 
WHERE status = 'pending' AND approval_level IS NULL;

UPDATE public.events 
SET approval_level = 'approved' 
WHERE status = 'approved';

UPDATE public.events 
SET approval_level = 'rejected' 
WHERE status = 'rejected';

-- Create function to advance approval level
CREATE OR REPLACE FUNCTION public.advance_approval_level(
  _event_id UUID,
  _approver_id UUID,
  _approver_role app_role,
  _comments TEXT DEFAULT NULL
)
RETURNS approval_level
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _current_level approval_level;
  _new_level approval_level;
BEGIN
  -- Get current level
  SELECT approval_level INTO _current_level FROM events WHERE id = _event_id;
  
  -- Determine new level based on role
  IF _approver_role = 'faculty' AND _current_level = 'pending_faculty' THEN
    _new_level := 'pending_hod';
    UPDATE events SET 
      approval_level = _new_level,
      approved_by_faculty = _approver_id,
      approved_at_faculty = now()
    WHERE id = _event_id;
    
  ELSIF _approver_role = 'hod' AND _current_level = 'pending_hod' THEN
    _new_level := 'pending_director';
    UPDATE events SET 
      approval_level = _new_level,
      approved_by_hod = _approver_id,
      approved_at_hod = now()
    WHERE id = _event_id;
    
  ELSIF _approver_role IN ('admin', 'hod') AND _current_level = 'pending_director' THEN
    _new_level := 'approved';
    UPDATE events SET 
      approval_level = _new_level,
      status = 'approved',
      approved_by_director = _approver_id,
      approved_at_director = now(),
      approved_by = _approver_id,
      approved_at = now()
    WHERE id = _event_id;
    
  ELSE
    RAISE EXCEPTION 'Invalid approval level transition for role %', _approver_role;
  END IF;
  
  -- Log to approval history
  INSERT INTO approval_history (event_id, action, from_level, to_level, performed_by, comments)
  VALUES (_event_id, 'approved', _current_level, _new_level, _approver_id, _comments);
  
  RETURN _new_level;
END;
$$;

-- Create function to reject event
CREATE OR REPLACE FUNCTION public.reject_event(
  _event_id UUID,
  _rejector_id UUID,
  _reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _current_level approval_level;
BEGIN
  SELECT approval_level INTO _current_level FROM events WHERE id = _event_id;
  
  UPDATE events SET 
    approval_level = 'rejected',
    status = 'rejected',
    rejection_reason = _reason,
    approved_by = _rejector_id,
    approved_at = now()
  WHERE id = _event_id;
  
  -- Log to approval history
  INSERT INTO approval_history (event_id, action, from_level, to_level, performed_by, comments)
  VALUES (_event_id, 'rejected', _current_level, 'rejected', _rejector_id, _reason);
END;
$$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_events_approval_level ON public.events(approval_level);
CREATE INDEX IF NOT EXISTS idx_approval_history_event_id ON public.approval_history(event_id);
