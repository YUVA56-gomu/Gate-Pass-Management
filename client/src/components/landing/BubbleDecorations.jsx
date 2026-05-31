import React from 'react'

/**
 * Bubble Decorations Component
 * Adds decorative bubble elements throughout the landing page
 */
export const BubbleDecorations = ({ variant = 'default' }) => {
  const bubbleVariants = {
    default: [
      { size: 'w-32 h-32', color: 'bg-blue-300', opacity: 'opacity-10', position: 'top-10 right-10', animation: 'animate-bounce-slow' },
      { size: 'w-24 h-24', color: 'bg-purple-300', opacity: 'opacity-15', position: 'bottom-20 left-10', animation: 'animate-pulse-slow' },
      { size: 'w-16 h-16', color: 'bg-blue-400', opacity: 'opacity-5', position: 'top-1/2 right-1/4', animation: 'animate-bounce-slow' }
    ],
    hero: [
      { size: 'w-40 h-40', color: 'bg-blue-200', opacity: 'opacity-20', position: 'top-20 right-10', animation: 'animate-pulse-slow' },
      { size: 'w-32 h-32', color: 'bg-purple-200', opacity: 'opacity-20', position: 'bottom-20 left-10', animation: 'animate-pulse-slow' },
      { size: 'w-20 h-20', color: 'bg-blue-300', opacity: 'opacity-10', position: 'top-40 left-20', animation: 'animate-bounce-slow' },
      { size: 'w-28 h-28', color: 'bg-purple-300', opacity: 'opacity-10', position: 'bottom-40 right-20', animation: 'animate-pulse-slow' },
      { size: 'w-16 h-16', color: 'bg-blue-400', opacity: 'opacity-5', position: 'top-1/2 right-1/4', animation: 'animate-bounce-slow' }
    ],
    section: [
      { size: 'w-24 h-24', color: 'bg-blue-300', opacity: 'opacity-10', position: 'top-0 right-0', animation: 'animate-bounce-slow' },
      { size: 'w-32 h-32', color: 'bg-purple-300', opacity: 'opacity-10', position: 'bottom-0 left-0', animation: 'animate-pulse-slow' }
    ],
    light: [
      { size: 'w-20 h-20', color: 'bg-blue-300', opacity: 'opacity-5', position: 'top-10 right-10', animation: 'animate-bounce-slow' },
      { size: 'w-16 h-16', color: 'bg-purple-300', opacity: 'opacity-5', position: 'bottom-10 left-10', animation: 'animate-pulse-slow' }
    ]
  }

  const bubbles = bubbleVariants[variant] || bubbleVariants.default

  return (
    <>
      {bubbles.map((bubble, index) => (
        <div
          key={index}
          className={`absolute ${bubble.size} ${bubble.color} rounded-full mix-blend-multiply filter blur-3xl ${bubble.opacity} ${bubble.animation} pointer-events-none`}
          style={{ [bubble.position.split(' ')[0]]: bubble.position.split(' ')[1] }}
        ></div>
      ))}
    </>
  )
}

export default BubbleDecorations
