# -*- coding: utf-8 -*-
from __future__ import absolute_import

import sys
import unittest
import base64

from .crypto import Crypter

class EncryptTests(unittest.TestCase):
    def test_padding_special_case(self):
        c = Crypter()
        str = 'a' * c.BLOCK_SIZE
        padded = c.pad_value(str)
        self.assertEqual(len(padded), len(str) * 2, "Padding did not add extra bytes in case of string equal to block size")

    def test_padding(self):
        c = Crypter()
        for x in range(c.BLOCK_SIZE ** 2):
            test_str = 'a' * x
            padded = c.pad_value(test_str)
            self.assertEqual(len(padded) % c.BLOCK_SIZE, 0, "padding did not result in a string that was a multiple of block size")
            pad_bytes = ord(padded[-1])
            unpadded = padded[:len(padded) - pad_bytes]
            self.assertEqual(len(unpadded), len(test_str))
            self.assertEqual(unpadded, 'a' * x)
