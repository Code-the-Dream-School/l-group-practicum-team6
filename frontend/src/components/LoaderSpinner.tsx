type LoaderSpinnerProps = {
  label?: string;
  className?: string;
  labelClassName?: string;
};

export default function LoaderSpinner({
  label,
  className = '',
  labelClassName = 'text-sm text-text-secondary',
}: LoaderSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`.trim()}>
      <div className="dance-morph-loader" aria-hidden="true">
        <div className="dance-morph-loader__content">
          {Array.from({ length: 13 }, (_, index) => (
            <div key={index} />
          ))}
        </div>
      </div>
      {label ? <p className={labelClassName}>{label}</p> : null}
    </div>
  );
}
