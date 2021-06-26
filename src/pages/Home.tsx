import { useHistory } from 'react-router-dom'
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import DarkModeToggle from "react-dark-mode-toggle";

import illustrationImg from '../assets/images/illustration.svg'
import darkLogoImg from '../assets/images/dark-logo.svg'
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';

import { database } from '../services/firebase';

import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

import '../styles/auth.scss';
import { useTheme } from '../hooks/useTheme';

export function Home() {
  const { theme, toggleTheme } = useTheme();
  const history = useHistory();
  const { user, signInWithGoogle } = useAuth()
  const [roomCode, setRoomCode] = useState('');

  async function handleCreateRoom() {
    if (!user) {
      await signInWithGoogle()
    }

    history.push('/rooms/new');
  }

  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault();

    if (roomCode.trim() === '') {
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()) {
      toast.error("Esta sala não existe.")
      return;
    }

    if (roomRef.val().endedAt) {
      toast.error("Esta sala já está fechada.")
      return;
    }

    history.push(`/rooms/${roomCode}`);
  }

  return (
    <div id="page-auth" className={theme}>
      <aside>
        <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
        <strong>Crie salas de Q&amp;A ao-vivo</strong>
        <p>Tire as dúvidas da sua audiência em tempo-real</p>
      </aside>
      <main>
        <DarkModeToggle
          className="toggle-theme"
          onChange={toggleTheme}
          checked={theme === 'dark'}
          size={80}
        />
        <div className="main-content">
          { theme === 'dark' ? (
            <img src={darkLogoImg} alt="Letmeask" />
          ) : (
            <img src={logoImg} alt="Letmeask" />
          )}
          <button onClick={handleCreateRoom} className="create-room">
            <img src={googleIconImg} alt="Logo do Google" />
            Crie sua sala com o Google
          </button>
          <div className="separator">ou entre em uma sala</div>
          <form onSubmit={handleJoinRoom}>
            <input 
              type="text"
              placeholder="Digite o código da sala"
              onChange={event => setRoomCode(event.target.value)}
              value={roomCode}
            />
            <Button type="submit">
              Entrar na sala
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}