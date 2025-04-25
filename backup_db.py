import paramiko
from scp import SCPClient

def createSSHClient(server, port, user, password, key_filename):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(server, port, user, key_filename=key_filename)
    return client

if __name__ == "__main__":
    ssh = createSSHClient('13.59.226.203', 22, 'ubuntu', '', "C:\\Users\\gasca\\.ssh\\gasca_kp.pem")
    scp = SCPClient(ssh.get_transport())
    scp.get('/home/ubuntu/PokeMasters/db_server/database/pokemasters.sqlite3', 'D:\\Projects\\PokeMasters\\db_server\\database\\backup.sqlite3')