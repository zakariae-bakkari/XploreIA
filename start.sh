#!/bin/bash

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} Lancement de XploreIA...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Démarrer le backend en arrière-plan
echo -e "${YELLOW}📡 Démarrage du backend PHP sur http://localhost:8000...${NC}"
php -S localhost:8000 -t backend/public > /dev/null 2>&1 &
BACKEND_PID=$!

# Attendre que le backend soit prêt
sleep 2

# Démarrer le frontend
echo -e "${YELLOW} Démarrage du frontend React sur http://localhost:5173...${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} XploreIA est démarré !${NC}"
echo -e "${GREEN} Frontend  : http://localhost:5173${NC}"
echo -e "${GREEN} Backend   : http://localhost:8000${NC}"
echo -e "${YELLOW} API Tools : http://localhost:8000/ai-tools${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Appuyez sur Ctrl+C pour tout arrêter${NC}"

# Attendre Ctrl+C et tuer les processus
trap "echo -e '\n${YELLOW}🛑 Arrêt des serveurs...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait