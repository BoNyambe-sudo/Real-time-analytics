export default function Loading() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />
      ))}
      <div className="h-80 animate-pulse bg-muted rounded-lg" />
    </div>
  );
}
