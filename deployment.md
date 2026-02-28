# HomeBoard Deployment Guide (Raspberry Pi & Portainer)

This guide outlines how to easily deploy HomeBoard to your local network using a Raspberry Pi running Docker and Portainer.

## Prerequisites

1. A Raspberry Pi connected to your home network.
2. **Docker** and **Docker Compose** installed on the Pi.
3. **Portainer** installed and running on the Pi.
4. Your HomeBoard code pushed to a remote Git repository (e.g., GitHub).

## Deployment Steps

Because HomeBoard builds its Docker image directly from the source code (`build: .` in the compose file), the best way to deploy it through Portainer is by connecting Portainer directly to your Git repository.

### 1. Create a New Stack

1. Open your Portainer web interface (usually `http://<RASPBERRY_PI_IP>:9000`).
2. Navigate to your local environment.
3. Click on **Stacks** in the left sidebar.
4. Click the **+ Add stack** button in the top right.

### 2. Configure the Stack

1. **Name**: Enter `homeboard`
2. **Build method**: Select **Repository**

### 3. Repository Settings

Fill in your repository details so Portainer can pull the code and build the image:

- **Repository URL**: The URL to your HomeBoard Git repository (e.g., `https://github.com/yourusername/home-board.git`).
- **Repository reference**: `refs/heads/main` (or whichever branch you use).
- **Compose path**: `docker-compose.yml` (This tells Portainer which file to execute).

*(Note: If your repository is private, you will need to enable Authentication and provide your credentials or a Personal Access Token).*

### 4. Deploy the Stack

1. Scroll down to the bottom of the page.
2. Click the **Deploy the stack** button.
3. **Wait!** Because Portainer needs to download the base Node.js Alpine image, install dependencies (pnpm), build the Vite frontend, and compile the Prisma client, this step might take **5-10 minutes** depending on the speed of your Raspberry Pi.

You can monitor the progress by checking the Portainer logs or your Pi's resource usage.

### 5. Access HomeBoard

Once the stack is successfully deployed and the container is marked as "running", HomeBoard is live on your network!

1. Open a browser on any device (like your tablet or phone) connected to your Wi-Fi.
2. Navigate to: `http://<RASPBERRY_PI_IP>:3005`

### 6. Auto-Updates & Maintenance

HomeBoard is configured with a manual auto-update feature located in the **Admin -> System** tab.

When you click "Check for Updates" in the UI, the application will:

1. Use the mounted Docker socket (`/var/run/docker.sock`) to securely talk to the host machine.
2. Pull the latest code directly from your Git repository's `main` branch.
3. Automatically rebuild the Docker image and restart the container seamlessly.

You do not need to log back into Portainer to perform routine application updates!
