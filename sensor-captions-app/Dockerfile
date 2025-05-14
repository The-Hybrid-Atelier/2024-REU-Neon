# ---- BUILD STAGE ----
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy everything into the container
COPY . .

# Optional: Debug what's inside
RUN echo "Files in build context:" && ls -al

# Install dependencies and build
RUN npm install
RUN npm run build

# ---- RUN STAGE ----
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy necessary runtime files from builder
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json .
COPY --from=builder /app/next.config.mjs .
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/pages pages
COPY --from=builder /app/app app
COPY --from=builder /app/data data
COPY --from=builder /app/scripts scripts
COPY --from=builder /app/tailwind.config.js tailwind.config.js
COPY --from=builder /app/postcss.config.mjs postcss.config.mjs
COPY --from=builder /app/jsconfig.json jsconfig.json

# Expose the port Next.js listens on
EXPOSE 3000

# Run the Next.js server
CMD ["npm", "start"]
