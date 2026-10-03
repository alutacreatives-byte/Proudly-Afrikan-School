import { SlideItem } from '../components/BuildInteractivePresentation';

export function parsePresentationSlides(content: string, title: string): SlideItem[] {
  if (!content) {
    return [
      {
        slideNumber: 1,
        title: title || 'Introduction to Subject',
        subtitle: 'Core concepts and foundational overview',
        slideContent: content || 'Welcome to this interactive presentation deck. Explore core concepts, mechanics, and pedagogical insights.',
        bulletPoints: ['Introduction to core principles', 'Key theoretical frameworks', 'Real-world application and context'],
        conceptBadge: 'OVERVIEW',
        speakerNotes: 'Welcome the audience and introduce the foundational theme.'
      }
    ];
  }

  // Split by markdown headers or sections
  const parts = content.split(/(?=#{1,3}\s+Slide|#{1,3}\s+\d+\.|---)/i);
  const slides: SlideItem[] = [];

  parts.forEach((part, idx) => {
    const lines = part.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    let slideTitle = `Slide ${idx + 1}`;
    let slideSubtitle = '';
    let slideContentText = '';
    const bulletPoints: string[] = [];
    let speakerNotes = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        slideTitle = trimmed.replace(/^#+\s*/, '').replace(/^\d+[\.\)]\s*/, '');
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        bulletPoints.push(trimmed.replace(/^[•\-\*]\s*/, ''));
      } else if (trimmed.toLowerCase().startsWith('note:') || trimmed.toLowerCase().startsWith('speaker:')) {
        speakerNotes = trimmed.replace(/^(note|speaker):\s*/i, '');
      } else if (!slideSubtitle && slideTitle !== trimmed) {
        slideSubtitle = trimmed;
      } else {
        slideContentText += (slideContentText ? ' ' : '') + trimmed;
      }
    });

    if (bulletPoints.length === 0) {
      bulletPoints.push('Core concept examination and analysis', 'Key mechanisms and practical implications', 'Critical evaluation and synthesis');
    }

    slides.push({
      slideNumber: slides.length + 1,
      title: slideTitle,
      subtitle: slideSubtitle || 'Advanced topic exploration & analysis',
      slideContent: slideContentText || `Deep dive into ${slideTitle}. Analyzing underlying principles and key takeaways.`,
      bulletPoints,
      conceptBadge: `CONCEPT ${slides.length + 1}`,
      speakerNotes: speakerNotes || `Discuss the key points of ${slideTitle} in detail with the audience.`
    });
  });

  if (slides.length === 0) {
    slides.push({
      slideNumber: 1,
      title: title || 'Presentation Deck',
      subtitle: 'Comprehensive study and lecture slides',
      slideContent: content,
      bulletPoints: ['Core curriculum highlights', 'Key structural mechanics', 'Synthesis and review'],
      conceptBadge: 'INTRODUCTION',
      speakerNotes: 'Introduce the main topic and set learning objectives.'
    });
  }

  return slides;
}

export function buildDynamicTopicSlides(topic: string, subject: string, grade?: string, count: number = 5): SlideItem[] {
  const slides: SlideItem[] = [];
  const baseTitle = topic || 'Core Subject Overview';
  
  for (let i = 1; i <= count; i++) {
    slides.push({
      slideNumber: i,
      title: i === 1 ? baseTitle : `${baseTitle} — Part ${i}`,
      subtitle: `Key concepts & analysis for ${subject} (${grade || 'General'})`,
      slideContent: `Detailed exploration of aspect ${i} of ${baseTitle}. Examining core mechanics, theoretical foundations, and practical applications within ${subject}.`,
      bulletPoints: [
        `Foundational principle #${i} governing ${baseTitle}`,
        `Comparative analysis and structural mechanics`,
        `Real-world case study and synthesis`
      ],
      conceptBadge: `PART ${i} • ${subject.toUpperCase()}`,
      speakerNotes: `Presenting part ${i} of ${baseTitle}. Focus on core mechanics and interactive discussion.`
    });
  }
  return slides;
}
