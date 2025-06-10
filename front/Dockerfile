# Usa a imagem oficial e super leve do Nginx para servir arquivos.
FROM nginx:1.25-alpine

# Copia todo o conteúdo da pasta atual (seus arquivos HTML, CSS, JS)
# para a pasta padrão que o Nginx usa para servir conteúdo web.
COPY . /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx.
EXPOSE 80

# Comando para iniciar o servidor Nginx quando o container for executado.
CMD ["nginx", "-g", "daemon off;"]