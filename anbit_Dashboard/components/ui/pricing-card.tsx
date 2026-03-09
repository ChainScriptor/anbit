import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  description: string;
  price: number;
  buttonText: string;
  list: string[];
  discount?: number;
  listHeading?: string;
  onButtonClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  hover?: 'default' | 'none';
}

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      hover = 'default',
      heading,
      description,
      price,
      discount,
      list,
      listHeading,
      buttonText,
      onButtonClick,
      ...props
    },
    ref,
  ) => {
    const withDiscount = React.useMemo(() => {
      return Math.round(price - (price * (discount ?? 100)) / 100);
    }, [price, discount]);

    const variantClasses = {
      default: 'border-gray-700 bg-gradient-to-br from-slate-700 to-slate-800',
      outline: 'border-gray-700 bg-gradient-to-br from-slate-700 to-slate-800',
      ghost: 'border-transparent bg-transparent',
    };
    const sizeClasses = {
      default: 'p-6 lg:p-8',
      sm: 'p-4 lg:p-6',
      lg: 'p-8 lg:p-10',
    };
    const hoverClasses = {
      default: 'hover:scale-[none] md:hover:scale-105',
      none: 'hover:scale-100',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full min-w-56 max-w-[300px] transform overflow-hidden rounded-lg border shadow-lg transition duration-300',
          variantClasses[variant],
          sizeClasses[size],
          hoverClasses[hover],
          className,
        )}
        {...props}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="mb-4 lg:mb-6 xl:mb-8">
            <h3 className="mb-2 text-2xl font-semibold text-white lg:mb-4 lg:text-3xl xl:text-4xl">
              {heading}
            </h3>
            <p className="text-gray-300 lg:text-base xl:text-xl">{description}</p>
          </div>

          <div>
            <div className="mb-3 flex space-x-2 xl:mb-4">
              <span className="text-3xl font-extrabold text-white lg:text-4xl xl:text-5xl">
                ${discount ? withDiscount : price}
              </span>
              {discount && (
                <span className="text-gray-400 line-through md:text-lg lg:text-xl xl:text-2xl">
                  ${price}
                </span>
              )}
            </div>

            {discount && (
              <div className="origin-center-right absolute right-[-50%] top-0 w-full -translate-x-6 translate-y-4 rotate-45 bg-gradient-to-r from-slate-600 to-slate-700 text-center text-white lg:text-lg xl:text-xl">
                {discount}%
              </div>
            )}

            <Button
              onClick={onButtonClick}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-600 hover:to-slate-600"
            >
              {buttonText}
            </Button>

            <ul className="mt-4 space-y-1 text-gray-200 lg:mt-6 lg:text-lg xl:mt-8 xl:text-xl">
              {listHeading && <h5>{listHeading}</h5>}
              {list.map((text, index) => (
                <li key={index} className="flex items-center">
                  <Check className="mr-2 h-5 w-5 shrink-0 text-emerald-500" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  },
);
PricingCard.displayName = 'PricingCard';

export { PricingCard };
