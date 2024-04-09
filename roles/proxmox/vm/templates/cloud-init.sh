#!/bin/sh
wget https://github.com/smallstep/cli/releases/download/v0.26.0/step_linux_amd64.tar.gz
tar -xzf step_linux_amd64.tar.gz
mv step_linux_amd64/bin/step /usr/bin/

step ca bootstrap --ca-url https://ca.engiqueer.net/ --fingerprint {{ step_ca_fingerprint }}

ssh-keygen -q -N "" -t ecdsa -f /etc/ssh/ssh_host_key
step ssh config --roots > /etc/ssh/ssh_user_key.pub
step ssh certificate --token {{ token.stdout}} --host --sign {{ hostname }} /etc/ssh/ssh_host_key.pub

cat <<EOF > /etc/ssh/sshd_config.d/ssh_ca.conf
TrustedUserCAKeys /etc/ssh/ssh_user_key.pub
HostKey /etc/ssh/ssh_host_key
HostCertificate /etc/ssh/ssh_host_key-cert.pub
EOF

systemctl restart sshd
