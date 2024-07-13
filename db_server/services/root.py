import os

class Root():
    @staticmethod
    def get_root():
        return os.path.join(os.path.dirname(__file__), "server")
    
    @staticmethod
    def app_dir():
        return os.path.abspath(os.path.join(__file__ ,"../.."))