import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';

export default function Comments({ trackId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Загружаем комментарии при открытии
  useEffect(() => {
    api.get(`/tracks/${trackId}/comments/`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  }, [trackId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы оставить комментарий!');
      return;
    }
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.post(`/tracks/${trackId}/comments/`, {
        body: newComment
      });
      
      // Добавляем новый комментарий в начало списка (он пришел с сервера)
      setComments([response.data, ...comments]);
      setNewComment(''); // Очищаем поле
    } catch (error) {
      console.error(error);
      alert('Ошибка при отправке комментария');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t border-zinc-800 pt-4">
      <h4 className="text-sm font-bold text-zinc-300 mb-3">Комментарии ({comments.length})</h4>
      
      {/* Форма добавления */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Написать комментарий..."
          className="flex-1 bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : 'Отправить'}
        </button>
      </form>

      {/* Список комментариев */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <p className="text-zinc-500 text-sm">Пока нет комментариев. Будьте первым!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-orange-500 text-xs font-bold">{comment.user}</span>
                <span className="text-zinc-600 text-[10px]">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-zinc-300 text-sm">{comment.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}