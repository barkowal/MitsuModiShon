# MitsuModiShon

<p align="center">
  <img src="https://github.com/barkowal/MitsuModiShon/blob/develop/app/public/MitsuIcon.png" alt="MitsuModiShon icon" width="100" height="100"/>
</p>

## About
Mitsumodishon is a web app, where users can create their own simple shapes and 3D animations. It's mainly intended for beginners or quick prototyping. The app is currently in development, so you may encounter many bugs.

## Features
- Edit default shapes
- Style objects
- Create simple animations
- Export to json, png, and mp4 files
- Create an account to save to the server

## Showcase
### MitsuModiShon
<img width="1080" alt="Home page" src="https://github.com/barkowal/MitsuModiShon/blob/develop/app/public/Screens/HomePage.png">

### Edit objects
<img width="1080" alt="Editor view" src="https://github.com/barkowal/MitsuModiShon/blob/develop/app/public/Screens/EditorView.png">

### Change shapes and style your objects
<img width="1080" alt="Modes" src="https://github.com/barkowal/MitsuModiShon/blob/develop/app/public/Screens/MitsuModes.png">

### Create animations
<img width="1080" alt="Animation screen" src="https://github.com/barkowal/MitsuModiShon/blob/develop/app/public/Screens/Animate.png">

### Explore other users' objects
<img width="1080" alt="Search page" src="https://github.com/barkowal/MitsuModiShon/blob/develop/app/public/Screens/SearchPage.png">

### Learn more
<img width="1080" alt="Larn page" src="https://github.com/barkowal/MitsuModiShon/blob/develop/app/public/Screens/LearnPage.png">


## Running locally
To run the project using Docker Compose, follow these steps:

Clone the project

```bash
git clone https://github.com/barkowal/MitsuModiShon.git
```

Go to the docker directory

```bash
cd MitsuModiShon/docker
```

Run the command

```bash
docker compose up --build
```

Access the application in your browser: http://172.20.0.1:8080

## Technologies and Tools Used

* [React](https://react.dev/)
* [Tailwind](https://tailwindcss.com/)
* [Shadcn](https://ui.shadcn.com/)
* [Three.js](https://threejs.org/)
* [i18next](https://www.i18next.com/)
* [ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm)

## License

[MIT](https://mit-license.org/)
