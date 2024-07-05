import bcrypt

# Password to Hash
user_password = b'admin33'
hash_password = b'$2b$12$LM.ZqyZzv7r6ankTnIKFweCi67DHNB9b2LB8LZdZwDaoblDSueEZK'

# Checking Password
check = bcrypt.checkpw(
    password=user_password,
    hashed_password=hash_password
)

# This will print True or False
print(check)

# Verifying the Password
if check:
    print("Welcome to GeekPython.")
else:
    print("Invalid Credential.")