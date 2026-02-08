

export default function CommunityPage() {
  const posts = [
    { id: 1, author: 'Sarah', title: 'Mejores prácticas en React Hooks', likes: 42, comments: 5 },
    { id: 2, author: 'Mike', title: 'Entendiendo TypeScript Generics', likes: 38, comments: 12 },
    { id: 3, author: 'Dev123', title: 'Ayuda con CSS Grid', likes: 15, comments: 8 },
  ];

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-(--text-primary) mb-6">Comunidad</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-(--bg-surface) p-4 rounded-(--radius-card) shadow-(--shadow-soft) border border-(--border-subtle)">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-(--bg-surface-2) rounded-full flex items-center justify-center text-xs font-bold text-(--text-secondary)">
                {post.author[0]}
              </div>
              <span className="text-sm font-medium text-(--text-primary)">{post.author}</span>
            </div>
            <h3 className="font-semibold text-(--text-primary) mb-3">{post.title}</h3>
            <div className="flex gap-4 text-sm text-(--text-muted)">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}