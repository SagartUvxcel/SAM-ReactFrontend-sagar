mkcert -key-file sam-key.pem -cert-file sam-cert.pem "localhost"   
docker-compose -f docker-compose.dev.yml up