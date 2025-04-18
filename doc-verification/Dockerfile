version: '3'

services:
  # MongoDB Service
  mongodb:
    image: mongo:latest
    container_name: healthlink-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - healthlink-network

  # Node.js Backend
  node-backend:
    build: ./backend
    container_name: healthlink-node-backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/healthlink
      - JWT_SECRET=project
      - GROQ_API_KEY=${GROQ_API_KEY}
      - NODE_ENV=production
    depends_on:
      - mongodb
    volumes:
      - ./backend:/app
      - /app/node_modules
      - backend_uploads:/app/uploads
    networks:
      - healthlink-network
    restart: unless-stopped

  # Python Document Verification Service
  doc-verification:
    build: ./doc-verification
    container_name: healthlink-doc-verification
    ports:
      - "5001:5001"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/healthlink
      - GROQ_API_KEY=${GROQ_API_KEY}
      - FLASK_ENV=production
      - FLASK_DEBUG=0
    depends_on:
      - mongodb
    volumes:
      - ./doc-verification:/app
      - doc_uploads:/app/uploads
    networks:
      - healthlink-network
    restart: unless-stopped

  # React Frontend
  react-frontend:
    build: ./frontend
    container_name: healthlink-frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
      - REACT_APP_VERIFICATION_URL=http://localhost:5001
      - NODE_ENV=production
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - node-backend
      - doc-verification
    networks:
      - healthlink-network
    restart: unless-stopped

volumes:
  mongo_data:
  doc_uploads:
  backend_uploads:

networks:
  healthlink-network:
    driver: bridge