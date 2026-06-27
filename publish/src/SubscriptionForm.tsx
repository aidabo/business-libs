import React, { useState } from 'react';

export interface InterestCategory {
  id: string;
  label: string;
}

export interface SubscriptionFormProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  interestCategories?: InterestCategory[];
  successMessage?: string;
  variant?: 'inline' | 'banner' | 'popup';
  onSubmit?: (email: string, interests: string[]) => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  title = 'Subscribe',
  description = 'Get the latest updates delivered to your inbox.',
  placeholder = 'Enter your email',
  buttonLabel = 'Subscribe',
  interestCategories,
  successMessage = 'Thank you for subscribing!',
  variant = 'inline',
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onSubmit?.(email, selectedInterests);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className={`rounded-lg bg-blue-50 p-8 text-center ${variant === 'banner' ? 'py-12' : ''}`}>
        <p className="text-lg font-semibold text-blue-800">{successMessage}</p>
      </section>
    );
  }

  const containerClass = variant === 'banner'
    ? 'rounded-none bg-gray-900 py-12'
    : 'rounded-lg bg-gray-50 p-8';

  return (
    <section className={containerClass}>
      <h3 className={`mb-2 text-xl font-bold ${variant === 'banner' ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      {description && (
        <p className={`mb-4 ${variant === 'banner' ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {buttonLabel}
          </button>
        </div>
        {interestCategories && interestCategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {interestCategories.map((cat) => (
              <label
                key={cat.id}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors ${
                  selectedInterests.includes(cat.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(cat.id)}
                  onChange={() => toggleInterest(cat.id)}
                  className="hidden"
                />
                {cat.label}
              </label>
            ))}
          </div>
        )}
      </form>
    </section>
  );
};

export default SubscriptionForm;
