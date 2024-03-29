import json
import numpy as np
import torch
import math


class TokenClassifier:

    def __init__(self):

        self.vocab = [
            'ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ',
            'ลบ', 'ลิงกั้ว', 'ลิงกัว', 'บัคคัล', 'บัคคอล', 'มีเสี้ยว', 'ดิสทัล', 'ทั้งหมด', 'ถึง',
            'มิซซิ่ง', 'คลาวน์', 'คลาวด์', 'อิมแพลนต์', 'อิมแพลนท์', 'อิมพลานต์', 'อิมพลานท์', 'บริดจ์', 'พีดีอาร์อี', 'โพลบบิ้งเดพท์', 'รีเส็ตชั่น',
            'เอ็มจีเจ', 'บรีดดิ้ง', 'บีโอพี', 'ซับปูเรชั่น', 'ซุปปูเรชั่น', 'โมบีลีตี้', 'เอ็มโอ', 'เฟอร์เคชั่น', 'ฟอร์เคชั่น', 'อันดู', 'อันโด'
        ]


    def inference(self, sentence):
        dp = self.maximal_matching(sentence)
        tokenized = self.backtrack(dp, sentence)
        # tokenized = sentence.split()
        labeled_token = self.labeled_token(tokenized)
        return labeled_token
        
    
    def maximal_matching(self, test_sentences):
        dp  =[[None]*len(test_sentences) for _ in range(len(test_sentences))]
        min_col = [len(test_sentences) for _ in range(len(test_sentences))]
        for i in range(len(test_sentences)):
            for j in range(len(test_sentences)):
                if i > j:continue
                elif i == 0 and test_sentences[i:j+1] in self.vocab:
                    dp[i][j] = 1
                    min_col[j] = min(min_col[j], dp[i][j])
                elif test_sentences[i:j+1] in self.vocab:
                    dp[i][j] = 1 + min_col[i-1]
                    min_col[j] = min(min_col[j], dp[i][j])
                else:
                    dp[i][j] = math.inf
        return dp
    
    def backtrack(self,dp, sentence):
        tokenized = []
        eow = len(dp)-1
        word_pos = []
        have_oov = False
        while eow >= 0:
            minn = math.inf
            for i in range(eow+1):
                if minn > dp[i][eow]:
                    minn = dp[i][eow]
                    sow = i
            if minn == math.inf:
                if not have_oov:
                    oov_end = eow
                    have_oov = True
                eow = eow - 1
            else:
                if have_oov:
                    oov_start = eow + 1
                    word_pos.append((oov_start, oov_end))
                    have_oov = False
                word_pos.append((sow,eow))
                eow = sow - 1
        word_pos.reverse()
        for sow, eow in word_pos:
            tokenized.append(sentence[sow:eow+1])
        return tokenized
    

    
    def labeled_token(self, tokens):
        token_label_list = []
        for token in tokens:
            if token in ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ']:
                token_label_list.append([token, "Number"])
            elif token in ['ลบ']:
                token_label_list.append([token, "Symbol"])
            elif token in ['ลิงกั้ว', 'ลิงกัว', 'บัคคัล', 'บัคคอล', 'มีเสี้ยว', 'ดิสทัล', 'ทั้งหมด',
                           'Lingual', 'lingual', 'Buccal', 'buccal', 'Mesial', 'mesial', 'Distal', 'distal']:
                token_label_list.append([token, "Side"])
            elif token in ['มิซซิ่ง', 'Missing', 'missing']:
                token_label_list.append([token, "Missing"])
            elif token in ['คลาวน์', 'คลาวด์', 'Crown', 'crown']:
                token_label_list.append([token, "Crown"])
            elif token in ['อิมแพลนต์', 'อินแพลนท์', 'อิมพลานต์', 'อิมพลานท์', 'Implant', 'implant']:
                token_label_list.append([token, "Implant"])
            elif token in ['บริดจ์', 'Bridge', 'bridge']:
                token_label_list.append([token, "Bridge"])
            elif token in ['พีดีอาร์อี', 'PDRE', 'pdre']:
                token_label_list.append([token, "PDRE"])
            elif token in ['โพลบบิ้งเดพท์', 'ProbingDepth', 'Probingdepth', 'probingdepth']:
                token_label_list.append([token, "PD"])
            elif token in ['รีเส็ตชั่น', 'Recession', 'recession']:
                token_label_list.append([token, "RE"])
            elif token in ['เอ็มจีเจ', 'MGJ', 'mgj']:
                token_label_list.append([token, "MGJ"])
            elif token in ['บรีดดิ้ง', 'บีโอพี', 'Bleeding', 'bleeding', 'BOP', 'bop']:
                token_label_list.append([token, "BOP"])
            elif token in ['ซับปูเรชั่น', 'ซุปปูเรชั่น', 'Suppuration', 'suppuration']:
                token_label_list.append([token, "SUP"])
            elif token in ['โมบีลีตี้', 'เอ็มโอ', 'Mobility', 'mobility', 'MO', 'mo']:
                token_label_list.append([token, "MO"])
            elif token in ['เฟอร์เคชั่น', 'ฟอร์เคชั่น', 'Furcation', 'furcation']:
                token_label_list.append([token, "FUR"])
            elif token in ['อันดู', 'อันโด', 'Undo', 'undo']:
                token_label_list.append([token, "Undo"])
            elif token in ['ถึง']:
                token_label_list.append([token, "To"])
        print(token_label_list)
        return token_label_list
