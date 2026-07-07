-- Role badge tooltips — English
UPDATE public.profile_role_types
SET tooltip_template = CASE id
  WHEN 'staff_dev' THEN 'Team developer since {date}'
  WHEN 'staff' THEN 'Staff since {date}'
  WHEN 'premium' THEN 'Premium since {date}'
  WHEN 'donator' THEN 'Donated and supported the site'
  WHEN 'gifter' THEN 'Gifted someone a premium membership'
  ELSE tooltip_template
END
WHERE id IN ('staff_dev', 'staff', 'premium', 'donator', 'gifter');
