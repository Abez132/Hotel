export default async function Home() {
  const response = await fetch("https://jsonplaceholder.typicode.com/photos");
  if (!response.ok) throw new Error("failed to fetch");
  const albums = await response.json();
  return (
    <div>
      <p className="text-5xl">Musics</p>
      <div className="flex flex-col gap-24">
        {albums.map((album: { id: number; title: string; url: string }) => (
          <div key={album.id}>
            <div>image</div>
            <h2>{album.title}</h2>
            <p>{album.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
