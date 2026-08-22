import bcrypt

HASH = b"$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

passwords_to_test = [b"secret", b"admin123", b"admin", b"password", b"test"]

for pw in passwords_to_test:
    result = bcrypt.checkpw(pw, HASH)
    print(f"{pw.decode():15s} -> {result}")
