from Crypto import Random
from Crypto.Random import random
from Crypto.Cipher import AES
import binascii
import base64

class Crypter():
    BLOCK_SIZE = AES.block_size

    def crypt(self, value, key):
        iv = Random.new().read(self.BLOCK_SIZE)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        return iv + cipher.encrypt(self.pad_value(value))

    def decrypt(self, value, key):
        iv = value[:self.BLOCK_SIZE]
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_with_padding = cipher.decrypt(value)[self.BLOCK_SIZE:]
        num_padding_bytes = decrypted_with_padding[-1]
        return decrypted_with_padding[0:len(decrypted_with_padding) - ord(num_padding_bytes)]

    def pad_value(self, value):
        padding_length = self._get_padding_length(value)
        padding_bytes = self._get_padding_bytes(padding_length)
        return value + ''.join([chr(x) for x in padding_bytes])

    def _get_padding_bytes(self, padding_length):
        assert padding_length <= self.BLOCK_SIZE, 'padding length cannot be greater than block size'
        assert padding_length > 0, 'padding length cannot be 0'
        return [padding_length for y in range(padding_length)]

    def _get_padding_length(self, value):
        block_size = self.BLOCK_SIZE
        pad_length = len(value) % block_size
        return block_size - pad_length
