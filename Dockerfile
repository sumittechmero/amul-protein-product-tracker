FROM binwiederhier/ntfy:latest

# Render exposes services on PORT 10000 by default
EXPOSE 10000

ENV NTFY_LISTEN_HTTP=":10000"
ENV NTFY_BEHIND_PROXY="true"
ENV NTFY_BASE_URL="https://amul-ntfy.onrender.com"
ENV NTFY_UPSTREAM_BASE_URL="https://ntfy.sh"

ENTRYPOINT ["ntfy", "serve"]
