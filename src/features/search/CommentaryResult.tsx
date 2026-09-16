function CommentaryResult({ commentary }: { commentary: SearchCommentary }) {
  const body = commentary.excerpt_am ?? commentary.content_am ?? "";

  return (
    <div className="px-4 py-4">
      {commentary.author_name_am && (
        <p className="mb-1.5 font-amharic text-[12px] font-medium text-gold-500/80">
          {commentary.author_name_am}
        </p>
      )}
      <p className="font-amharic text-[15px] leading-[1.9] text-text-secondary">
        {renderMarked(body)}
      </p>
    </div>
  );
}
