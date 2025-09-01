# Coin Game (Frontend)

A socket-based interactive **coin flip game** designed as a team-building activity.  
This is the **frontend repository**, responsible for the UI, gameplay logic, and socket communication with the backend.

## 🚀 Features
- Host can **create a game room**.
- Teams can **join a room** using a code.
- Multiple game levels:
  - **Coin Flipping**
  - **Coin Moving**
- Tracks **time per round** and **total time**.
- Displays **results at the end** with rankings.
- Real-time updates using **Socket.IO**.

## 🏗️ Tech Stack
- **React.js**
- **Socket.IO Client**
- **Tailwind CSS** (if used in styling)
- **TypeScript/JavaScript** (depending on repo)

## 📂 Project Structure
/src
/components # Reusable UI components
/hooks # Custom hooks for socket/game logic
/pages # Pages and routes
/utils # Helper functions


## ⚡ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/jemis-lakhani/coingame.git
cd coingame

2. Install Dependencies
npm install
# or
yarn install

3. Run Development Server
npm start
# or
yarn start

Frontend will run on:
👉 http://localhost:3000

4. Connect to Backend

Make sure the backend server is running. Update the backend socket URL in the environment/config file if required.
```
## 🎮 How to Play

Host creates a room.

Teams join using the room code.

Play multiple levels (coin flipping, coin moving).

Time is recorded each round.

Final results are shown at the end.

## 📦 Build for Production
```bash
npm run build
```
