#!/bin/bash

echo "🔍 Verificando configuración de CORS..."

# Verificar si el backend está respondiendo
echo "📡 Probando conexión al backend..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health

if [ $? -eq 0 ]; then
    echo "✅ Backend responde correctamente"
else
    echo "❌ Backend no responde"
fi

# Verificar CORS con preflight OPTIONS
echo "🔄 Probando preflight OPTIONS..."
curl -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v http://localhost:3000/api/auth/login 2>&1 | grep -E "(Access-Control|HTTP/)"

# Verificar CORS con request real
echo "📤 Probando request real..."
curl -X POST \
  -H "Origin: http://localhost:4200" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  -v http://localhost:3000/api/auth/login 2>&1 | grep -E "(Access-Control|HTTP/)"

echo "✅ Verificación completada" 