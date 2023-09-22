// SubscribeButton.js
import React from 'react';

const SubscribeButton = ({ selectedPlan, selectedDuration }) => {
  const handleSubscribe = () => {
    if (selectedPlan && selectedDuration) {
      // Implement your subscription logic here
      alert(`Subscribing to ${selectedPlan} plan for ${selectedDuration}`);
    } else {
      alert('Please select a plan and duration.');
    }
  };

  return (
    <div className='m-auto'>
      <button className="w-100 btn btn-primary text-capitalize common-btn-font" onClick={handleSubscribe}>Subscribe </button>
    </div>
  );
};

export default SubscribeButton;
