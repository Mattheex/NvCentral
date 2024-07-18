import bcrypt

# Password to Hash
my_password = b'RottingerTeam'

# Generating Salt
salt = bcrypt.gensalt()

# Hashing Password
hash_password = bcrypt.hashpw(
    password=my_password,
    salt=salt
)

print(hash_password)
