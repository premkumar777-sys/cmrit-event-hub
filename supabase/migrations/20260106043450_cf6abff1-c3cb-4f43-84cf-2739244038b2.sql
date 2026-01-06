-- Update the trigger function to assign roles based on email format
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_role app_role;
BEGIN
  user_email := NEW.email;
  
  -- Determine role based on email format
  -- Student: matches pattern like 22B81A0501@cmrithyderabad.edu.in (rollno@cmrithyderabad.edu.in)
  -- Club Organizer: matches pattern like coding@cmrithyderabad.edu.in (clubname@cmrithyderabad.edu.in)
  -- Faculty/Admin: matches pattern like john@cmrithyderabad.edu.in (name@cmrithyderabad.edu.in)
  
  IF user_email ~ '^[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{4}@cmrithyderabad\.edu\.in$' THEN
    -- Student roll number pattern (e.g., 22B81A0501)
    user_role := 'student';
  ELSIF user_email ~ '^(coding|robotics|ieee|csi|gdsc|nss|sports|cultural|music|dance|drama|photography|literary|eco|entrepreneurship)@cmrithyderabad\.edu\.in$' THEN
    -- Known club names
    user_role := 'organizer';
  ELSIF user_email ~ '^[a-zA-Z]+(\.[a-zA-Z]+)*@cmrithyderabad\.edu\.in$' THEN
    -- Faculty pattern (name.surname or just name)
    user_role := 'faculty';
  ELSE
    -- Default to student for any other cmrithyderabad.edu.in emails
    user_role := 'student';
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Assign role based on email
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;