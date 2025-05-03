-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to extract username from OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  full_name_val TEXT;
  company_val TEXT;
  email_val TEXT;
  avatar_url_val TEXT;
BEGIN
  -- Extract email from auth.users
  SELECT email INTO email_val FROM auth.users WHERE id = NEW.id;
  
  -- Handle Google OAuth data
  IF NEW.raw_user_meta_data->>'iss' = 'https://accounts.google.com' THEN
    -- Extract username and full name from Google data
    username_val := COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'name',
      split_part(email_val, '@', 1)
    );
    full_name_val := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    );
    avatar_url_val := NEW.raw_user_meta_data->>'picture';
  
  -- Handle GitHub OAuth data
  ELSIF NEW.raw_user_meta_data->>'provider' = 'github' THEN
    -- Extract username and full name from GitHub data
    username_val := COALESCE(
      NEW.raw_user_meta_data->>'preferred_username', 
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'name',
      split_part(email_val, '@', 1)
    );
    full_name_val := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    );
    avatar_url_val := NEW.raw_user_meta_data->>'avatar_url';
  
  -- Handle other providers or email signup
  ELSE
    -- Extract username and full name from regular user data
    username_val := COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'name',
      split_part(email_val, '@', 1)
    );
    full_name_val := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    );
    avatar_url_val := NEW.raw_user_meta_data->>'avatar_url';
  END IF;
  
  -- Set default company value
  company_val := COALESCE(NEW.raw_user_meta_data->>'company', '');
  
  -- Create a new profile for the user with proper fallbacks
  INSERT INTO public.profiles (
    id, 
    username,
    full_name,
    email,
    company,
    avatar_url,
    is_admin,
    newsletter_subscription,
    marketing_consent
  )
  VALUES (
    NEW.id,
    username_val,
    full_name_val,
    email_val,
    company_val,
    avatar_url_val,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'newsletter_subscription')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
