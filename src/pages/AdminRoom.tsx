import { useHistory, useParams } from 'react-router-dom'
import toast from 'react-hot-toast';
import Modal from 'react-modal';

import logoImg from '../assets/images/logo.svg';
import darkLogoImg from '../assets/images/dark-logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';
import emptyQuestionsImg from '../assets/images/empty-questions.svg';

import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';

import '../styles/room.scss';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const history = useHistory()
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { theme } = useTheme();
  const { title, questions } = useRoom(roomId);
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const [ questionId, setQuestionId ] = useState('');

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    })
    toast.success('Sala encerrada com sucesso.')

    history.push('/');
  }

  async function confirmDeleteQuestion(questionId: string) {
    setQuestionId(questionId);
    setIsModalVisible(true);
  }

  async function confirmCloseRoom() {
    setIsModalVisible(true);
  }

  async function handleDeleteQuestion(){
    setIsModalVisible(false);
    await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    toast.success('Pergunta excluída com sucesso.')
    setQuestionId('');
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    })
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    })
  }

  return (
    <div id="page-room" className={theme}>
      <header>
        <div className="content">
          { theme === 'dark' ? (
            <img src={darkLogoImg} alt="Letmeask" />
          ) : (
            <img src={logoImg} alt="Letmeask" />
          )}
          <div>
            <RoomCode code={roomId} />
            <Button isOutlined onClick={confirmCloseRoom}>Encerrar sala</Button>
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          { questions.length > 0 && <span>{questions.length} pergunta(s)</span> }
        </div>

        { questions.length === 0 ? (
          <>
            <div className="empty-questions">
              <img src={emptyQuestionsImg} alt="There are no questions created in this room" />
              <h2>Nenhuma pergunta por aqui...</h2>
              <p>Envie o código da sala para seus amigos e comece a responder as perguntas!</p>
            </div>
          </>
          ) : (
            <div className="question-list">
              {questions.map(question => {
                return (
                  <Question
                    key={question.id}
                    content={question.content}
                    author={question.author}
                    isAnswered={question.isAnswered}
                    isHighlighted={question.isHighlighted}
                  >
                    {!question.isAnswered && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCheckQuestionAsAnswered(question.id)}
                        >
                          <img src={checkImg} alt="Marcar pergunta como respondida" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHighlightQuestion(question.id)}
                        >
                          <img src={answerImg} alt="Dar destaque à pergunta" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => confirmDeleteQuestion(question.id)}
                    >
                      <img src={deleteImg} alt="Remover pergunta" />
                    </button>
                  </Question>
                );
              })}
            </div>
          )
        }

        <div>
          <Modal
            className='react-modal'
            isOpen={isModalVisible}
            onRequestClose={() => { setQuestionId(''); setIsModalVisible(false);}}
          >

          { questionId === '' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" stroke="#E73F5D" strokeWidth="0.3" color="#E73F5D" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
              <h2>Encerrar Sala</h2>
              <p>Tem certeza que você deseja encerrar esta sala?</p>
              <div>
                <Button className="cancel-button" onClick={() => setIsModalVisible(false)}>Cancelar</Button>
                <Button className="close-button" onClick={handleEndRoom}>Sim, encerrar</Button>
              </div>
            </>
          ) : (
            <>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                <path d="M3 5.99988H5H21" stroke="#E73F5D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8 5.99988V3.99988C8 3.46944 8.21071 2.96074 8.58579 2.58566C8.96086 2.21059 9.46957 1.99988 10 1.99988H14C14.5304 1.99988 15.0391 2.21059 15.4142 2.58566C15.7893 2.96074 16 3.46944 16 3.99988V5.99988M19 5.99988V19.9999C19 20.5303 18.7893 21.039 18.4142 21.4141C18.0391 21.7892 17.5304 21.9999 17 21.9999H7C6.46957 21.9999 5.96086 21.7892 5.58579 21.4141C5.21071 21.039 5 20.5303 5 19.9999V5.99988H19Z" stroke="#E73F5D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h2>Excluir pergunta</h2>
              <p>Tem certeza que você deseja excluir esta pergunta?</p>
              <div>
                <Button className="cancel-button" onClick={() => setIsModalVisible(false)}>Cancelar</Button>
                <Button className="close-button" onClick={handleDeleteQuestion}>Sim, excluir</Button>
              </div>
            </>
          )}
          </Modal>
        </div>
      </main>
    </div>
  );
}