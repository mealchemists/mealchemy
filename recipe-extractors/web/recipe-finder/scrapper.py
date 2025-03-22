# # from abc import ABC, abstractmethod

# HEADER = {'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7'}


# class Scrapper():
#     def __init__(self, url, parent_tag, child_tag):
#         self.url = url
#         self.parent_tag = parent_tag
#         self.child_tag = child_tag
#         self.header = HEADER

#     def has_child_tag(self, tag):
#         return tag.name == self.parent_tag and tag.find(self.child_tag) is not None