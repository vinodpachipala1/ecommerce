import React from 'react';
import { HiCheck } from 'react-icons/hi';

const OrderStatusTracker = ({ status }) => {
  const steps = [
    { activeLabel: 'Processing', completedLabel: 'Processed' },
    { activeLabel: 'Shipped', completedLabel: 'Shipped' },
    { activeLabel: 'Out for Delivery', completedLabel: 'Out for Delivery' },
    { activeLabel: 'Delivered', completedLabel: 'Delivered' },
  ];

  return (
    <div className="w-full p-4 border-t border-gray-200 mt-4">
      <div className="flex items-center relative">
        {steps.map((step, index) => {
          
          const s = status?.toLowerCase();
          
          const activeStepIndex = {
            'processing': 0,    
            'processed': 1,     
            'shipped': 2,        
            'out for delivery': 3,  
            'delivered': 99  
          }[s] ?? -1;

          const isCompleted = index < activeStepIndex;
          const isActive = index === activeStepIndex;
          const isPending = index > activeStepIndex;

          return (
            <React.Fragment key={step.activeLabel}>
              <div
                aria-current={isActive ? 'step' : undefined}
                className={`
                  relative w-8 h-8 flex items-center justify-center rounded-full border-2 font-bold transition-all duration-300
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isActive ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-200 scale-110' : ''}
                  ${isPending ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                `}
              >
                {isCompleted ? <HiCheck className="w-5 h-5" /> : <span>{index + 1}</span>}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-1 transition-all duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex justify-between mt-3">
        {steps.map((step, index) => {
          const s = status?.toLowerCase();
          const activeStepIndex = { 'processing': 0, 'processed': 1, 'shipped': 2, 'out for delivery': 3, 'delivered': 99 }[s] ?? -1;

          const isCompleted = index < activeStepIndex;
          const isActive = index === activeStepIndex;
          
          const isStepActiveOrFinished = isCompleted || isActive;
          const label = isCompleted ? step.completedLabel : step.activeLabel;

          return (
            <div key={step.activeLabel} className="w-1/4 text-center">
              <p
                className={`text-xs sm:text-sm font-medium truncate max-w-[80px] mx-auto
                ${isStepActiveOrFinished ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTracker;