// Dynamic Presentation Builder: Generates structured, narrative-based slides
// Strictly 5, 10, or 15 slides with logical, non-repeating topic-specific sections.

export interface PresentationSlideData {
  id: string;
  slideNumber: number;
  slideType: 'title' | 'concept' | 'case-study' | 'activity' | 'summary';
  title: string;
  subtitle: string;
  slideContent: string;
  bulletPoints: string[];
  speakerNotes: string;
  suggestedVisualOrDiagram: string;
  discussionOrEngagementPrompt: string;
}

export function buildDynamicTopicSlides(
  topic: string,
  subject: string,
  gradeLevel: string = 'Senior Secondary / High School (Grades 9-12)',
  targetCount: number = 5
): PresentationSlideData[] {
  const safeTopic = (topic || '').trim() || 'Core Curriculum Study';
  const safeSubject = (subject || '').trim() || 'Academic Inquiry';
  const count = targetCount === 15 ? 15 : targetCount === 10 ? 10 : 5;

  if (count === 5) {
    return [
      {
        id: 's-1',
        slideNumber: 1,
        slideType: 'title',
        title: `SYNOPSIS: ${safeTopic.toUpperCase()}`,
        subtitle: `Curricular Scope & Fundamental Orientation in ${safeSubject}`,
        slideContent: `${safeTopic} represents a cornerstone theme within modern ${safeSubject}. Mastering this subject enables students to connect core theoretical principles to concrete observations, developing analytical reasoning, systems-level problem solving, and contextual awareness across real-world environments.`,
        bulletPoints: [],
        speakerNotes: `Welcome students to our session on ${safeTopic}. Introduce the central inquiry question and outline how today's exploration connects directly to fundamental principles in ${safeSubject}.`,
        suggestedVisualOrDiagram: `High-contrast overview diagram illustrating the central role of ${safeTopic} within ${safeSubject}.`,
        discussionOrEngagementPrompt: `How does our understanding of ${safeTopic} reshape how we examine everyday phenomena in ${safeSubject}?`
      },
      {
        id: 's-2',
        slideNumber: 2,
        slideType: 'concept',
        title: `BACKGROUND: FOUNDATIONS OF ${safeTopic.toUpperCase()}`,
        subtitle: 'Historical Context, Origins, and Core Theoretical Frameworks',
        slideContent: `The study of ${safeTopic} emerged from the need to systematically explain governing mechanisms in ${safeSubject}. Early pioneers established baseline laws, operational criteria, and diagnostic frameworks that continue to guide contemporary inquiry and experimental methodology today.`,
        bulletPoints: [],
        speakerNotes: `Trace the evolution of ${safeTopic}. Highlight how initial theoretical hypotheses were verified and refined through evidence-based research in ${safeSubject}.`,
        suggestedVisualOrDiagram: `Timeline and foundational conceptual map showing the genesis and formalization of ${safeTopic}.`,
        discussionOrEngagementPrompt: `What historical developments were most instrumental in establishing the recognized principles of ${safeTopic}?`
      },
      {
        id: 's-3',
        slideNumber: 3,
        slideType: 'concept',
        title: `KEY DEVELOPMENTS: MECHANISMS IN ACTION`,
        subtitle: `Operational Dynamics and Governing Relationships in ${safeTopic}`,
        slideContent: `At its operational core, ${safeTopic} functions through interacting variables, feedback loops, and defined cause-and-effect pathways. Analyzing these dynamic behaviors allows practitioners in ${safeSubject} to accurately predict outcomes and diagnose complex system disruptions.`,
        bulletPoints: [],
        speakerNotes: `Walk students step-by-step through the core mechanisms of ${safeTopic}. Emphasize the interdependence of components and how changing one variable affects overall stability.`,
        suggestedVisualOrDiagram: `Detailed systems flowchart showing inputs, transformation processes, feedback mechanisms, and observable outputs for ${safeTopic}.`,
        discussionOrEngagementPrompt: `If a single variable within the ${safeTopic} process is altered, what cascading effects occur across the system?`
      },
      {
        id: 's-4',
        slideNumber: 4,
        slideType: 'concept',
        title: `KEY TAKEAWAYS: ESSENTIAL SYNTHESIS`,
        subtitle: `Critical Insights and Core Mastery Benchmarks for ${safeTopic}`,
        slideContent: `True mastery of ${safeTopic} requires synthesizing theoretical rules with practical problem-solving. Retaining these core principles equips learners to analyze multifaceted scenarios, avoid common misconceptions, and formulate rigorous, evidence-supported conclusions.`,
        bulletPoints: [],
        speakerNotes: `Consolidate the primary insights covered so far. Reiterate why these conceptual anchors are vital for exams, field applications, and advanced learning in ${safeSubject}.`,
        suggestedVisualOrDiagram: `Synthesis matrix summarizing key formulas, axioms, and application criteria for ${safeTopic}.`,
        discussionOrEngagementPrompt: `Which single principle of ${safeTopic} provides the most powerful explanatory leverage when solving complex problems?`
      },
      {
        id: 's-5',
        slideNumber: 5,
        slideType: 'summary',
        title: `CONCLUSION: FUTURE HORIZONS & IMPACT`,
        subtitle: `Practical Legacy and Emerging Innovations in ${safeTopic}`,
        slideContent: `As ${safeSubject} advances, contemporary innovations and research continually unlock fresh applications for ${safeTopic}. Engaging deeply with these concepts prepares learners to lead future technological, ecological, and socioeconomic solutions across Africa and the world.`,
        bulletPoints: [],
        speakerNotes: `Conclude the lesson by celebrating student progress. Assign the reflective follow-up activity and encourage independent exploration of emerging frontiers in ${safeTopic}.`,
        suggestedVisualOrDiagram: `Inspirational roadmap graphic illustrating next-generation research avenues and collaborative career applications in ${safeSubject}.`,
        discussionOrEngagementPrompt: `Looking forward, what unanswered question in ${safeTopic} could yield the most transformative breakthrough for our society?`
      }
    ];
  }

  if (count === 10) {
    return [
      {
        id: 's-1',
        slideNumber: 1,
        slideType: 'title',
        title: `SYNOPSIS: ${safeTopic.toUpperCase()}`,
        subtitle: `Master Curricular Scope & Systematic Orientation in ${safeSubject}`,
        slideContent: `${safeTopic} is a foundational pillar of modern ${safeSubject}. Mastering this discipline enables learners to evaluate systemic interactions, apply empirical methodologies, and connect theoretical frameworks directly to tangible real-world problem-solving contexts.`,
        bulletPoints: [],
        speakerNotes: `Welcome everyone. Establish the learning roadmap for ${safeTopic} and introduce our key guiding inquiry for today's master deck.`,
        suggestedVisualOrDiagram: `High-impact thematic title graphic showcasing the core conceptual pillars of ${safeTopic}.`,
        discussionOrEngagementPrompt: `What central problem in ${safeSubject} does ${safeTopic} primarily aim to resolve?`
      },
      {
        id: 's-2',
        slideNumber: 2,
        slideType: 'concept',
        title: `HISTORICAL BACKGROUND & GENESIS`,
        subtitle: `Intellectual Origins and Baseline Theoretical Development`,
        slideContent: `The theoretical emergence of ${safeTopic} resolved fundamental bottlenecks in early ${safeSubject}. Scholars formalized standard nomenclature, governing assumptions, and empirical benchmarks that transformed intuitive observations into a rigorous, verifiable science.`,
        bulletPoints: [],
        speakerNotes: `Walk learners through the evolutionary milestones of ${safeTopic}. Emphasize how early experimental dilemmas led to current standardized paradigms.`,
        suggestedVisualOrDiagram: `Historical milestone timeline illustrating the transition from initial hypotheses to verified laws in ${safeTopic}.`,
        discussionOrEngagementPrompt: `Why were early models of ${safeTopic} insufficient, and what paradigm shift corrected them?`
      },
      {
        id: 's-3',
        slideNumber: 3,
        slideType: 'concept',
        title: `CORE PRINCIPLES & GOVERNING LAWS`,
        subtitle: `Structural Frameworks and Fundamental Axioms of ${safeTopic}`,
        slideContent: `Every dimension of ${safeTopic} operates according to established axioms and structural relationships. Understanding these underlying rules empowers students in ${safeSubject} to deconstruct complex challenges into manageable, predictable operational dynamics.`,
        bulletPoints: [],
        speakerNotes: `Focus on clarifying formal terminology. Differentiate between colloquial assumptions and rigorous scientific definitions of ${safeTopic}.`,
        suggestedVisualOrDiagram: `Structural pyramid mapping core foundational axioms at the base and derived laws at the apex.`,
        discussionOrEngagementPrompt: `How do the governing axioms of ${safeTopic} constrain the behavior of the overall system?`
      },
      {
        id: 's-4',
        slideNumber: 4,
        slideType: 'concept',
        title: `KEY DEVELOPMENTS & BREAKTHROUGHS`,
        subtitle: `Transformative Milestones and Paradigm Shifts in ${safeTopic}`,
        slideContent: `Recent decades have yielded significant breakthroughs in ${safeTopic}, refining precision and expanding practical utility. Advanced instruments and computational modeling have uncovered subtle interactions that were previously undetectable in conventional ${safeSubject}.`,
        bulletPoints: [],
        speakerNotes: `Examine the pivotal breakthrough experiments that transformed modern perspectives on ${safeTopic}. Contrast historical constraints with contemporary capabilities.`,
        suggestedVisualOrDiagram: `Comparative visualization detailing before-and-after breakthrough performance and diagnostic accuracy.`,
        discussionOrEngagementPrompt: `Which technological or analytical discovery did the most to accelerate advancement in ${safeTopic}?`
      },
      {
        id: 's-5',
        slideNumber: 5,
        slideType: 'case-study',
        title: `EMPIRICAL CASE STUDY & EVIDENCE`,
        subtitle: `Authentic Implementation and Measured Field Outcomes`,
        slideContent: `Real-world field implementations of ${safeTopic} demonstrate how theory translates into measurable impact. Documented evidence reveals how targeted interventions overcome environmental constraints, optimize resources, and generate sustainable, quantifiable benefits.`,
        bulletPoints: [],
        speakerNotes: `Present the empirical case study with concrete data points. Highlight how practitioners balanced resource constraints with scientific rigor.`,
        suggestedVisualOrDiagram: `Case study infographic comparing pre-intervention baseline metrics against post-implementation results.`,
        discussionOrEngagementPrompt: `What critical environmental variables in this case study posed the greatest challenge to applying ${safeTopic}?`
      },
      {
        id: 's-6',
        slideNumber: 6,
        slideType: 'concept',
        title: `ANALYTICAL METHODOLOGY & MODELING`,
        subtitle: `Step-by-Step Diagnostic Frameworks and Problem-Solving`,
        slideContent: `Rigorous problem solving in ${safeTopic} demands a structured methodology: diagnostic assessment, variable isolation, quantitative modeling, and iterative verification. Following this protocol prevents intuitive errors and guarantees reproducible analytical results.`,
        bulletPoints: [],
        speakerNotes: `Model the analytical diagnostic protocol live on the whiteboard. Emphasize why skipping the initial isolation step leads to flawed conclusions.`,
        suggestedVisualOrDiagram: `Four-phase procedural flowchart depicting diagnostic triage, parameter calculation, and output verification.`,
        discussionOrEngagementPrompt: `Why is disciplined parameter isolation so vital when troubleshooting complex anomalies in ${safeTopic}?`
      },
      {
        id: 's-7',
        slideNumber: 7,
        slideType: 'concept',
        title: `CRITICAL PERSPECTIVES & COMMON PITFALLS`,
        subtitle: `Deconstructing Misconceptions and Boundary Limitations`,
        slideContent: `A frequent trap in ${safeTopic} is oversimplifying multivariable phenomena into single-cause assumptions. By critically examining edge cases, boundary limits, and common fallacies, learners cultivate the nuanced discernment required for professional mastery.`,
        bulletPoints: [],
        speakerNotes: `Directly address common student misconceptions regarding ${safeTopic}. Provide explicit contrastive examples that clarify subtle conceptual distinctions.`,
        suggestedVisualOrDiagram: `Contrastive analysis table displaying popular misconceptions alongside verifiable empirical truths for ${safeTopic}.`,
        discussionOrEngagementPrompt: `What is the most widespread misunderstanding regarding ${safeTopic}, and why does it persist?`
      },
      {
        id: 's-8',
        slideNumber: 8,
        slideType: 'concept',
        title: `PRACTICAL & REGIONAL APPLICATIONS`,
        subtitle: `Real-World Impact Across African and Global Communities`,
        slideContent: `The principles of ${safeTopic} find vital expression across agriculture, infrastructure, technology, and public health. African innovators are adapting these core mechanisms to engineer context-specific, cost-effective solutions for widespread local challenges.`,
        bulletPoints: [],
        speakerNotes: `Highlight authentic African case applications of ${safeTopic}. Challenge students to envision practical implementations within their own local communities.`,
        suggestedVisualOrDiagram: `Regional application map highlighting active deployment sectors and socioeconomic impact metrics.`,
        discussionOrEngagementPrompt: `How can the principles of ${safeTopic} be mobilized to address an urgent challenge in your immediate region?`
      },
      {
        id: 's-9',
        slideNumber: 9,
        slideType: 'concept',
        title: `KEY TAKEAWAYS & CORE SYNTHESIS`,
        subtitle: `Consolidated Conceptual Anchors for Lifelong Mastery`,
        slideContent: `Synthesizing ${safeTopic} involves connecting historical origins, operational mechanics, analytical protocols, and applied implementations. Internalizing these key insights provides an enduring conceptual toolkit for higher-order reasoning across ${safeSubject}.`,
        bulletPoints: [],
        speakerNotes: `Review the master synthesis checklist with learners. Solicit student volunteers to summarize the core governing principle in their own words.`,
        suggestedVisualOrDiagram: `Comprehensive synthesis mind-map interconnecting all major thematic threads of ${safeTopic}.`,
        discussionOrEngagementPrompt: `How would you explain the fundamental essence of ${safeTopic} to someone new to ${safeSubject}?`
      },
      {
        id: 's-10',
        slideNumber: 10,
        slideType: 'summary',
        title: `CONCLUSION & HORIZON INQUIRIES`,
        subtitle: `Future Trajectories, Unresolved Questions, and Next Steps`,
        slideContent: `The frontier of ${safeTopic} remains vibrant with emerging research questions and cross-disciplinary potential. As students conclude this master exploration, they are primed to pursue advanced inquiries and contribute innovative breakthroughs to ${safeSubject}.`,
        bulletPoints: [],
        speakerNotes: `Congratulate students on completing this deep-dive exploration. Provide instructions for the post-lecture synthesis assignment and further reading.`,
        suggestedVisualOrDiagram: `Forward-looking horizon radar charting emerging research opportunities over the coming decade in ${safeSubject}.`,
        discussionOrEngagementPrompt: `What emerging question in ${safeTopic} inspires you the most as a future researcher or practitioner?`
      }
    ];
  }

  // 15 Slides
  return [
    {
      id: 's-1',
      slideNumber: 1,
      slideType: 'title',
      title: `SYNOPSIS: ${safeTopic.toUpperCase()}`,
      subtitle: `Comprehensive Curricular Scope & Foundational Orientation in ${safeSubject}`,
      slideContent: `${safeTopic} stands as an indispensable area of inquiry in ${safeSubject}. This comprehensive curriculum deck explores its theoretical foundations, governing dynamics, empirical applications, and future frontiers to cultivate profound academic mastery and analytical rigor.`,
      bulletPoints: [],
      speakerNotes: `Welcome everyone to this comprehensive 15-part master slide series on ${safeTopic}. Establish our learning objectives and thematic roadmap.`,
      suggestedVisualOrDiagram: `Master course orientation graphic showcasing the progressive 15-stage pedagogical pathway.`,
      discussionOrEngagementPrompt: `Why does ${safeTopic} hold such pivotal significance in modern ${safeSubject} studies?`
    },
    {
      id: 's-2',
      slideNumber: 2,
      slideType: 'concept',
      title: `HISTORICAL GENESIS & EVOLUTION`,
      subtitle: `Origins, Formative Debates, and the Journey to Formal Science`,
      slideContent: `The intellectual lineage of ${safeTopic} traces through pivotal debates where speculative notions gave way to empirical validation. Early scholars in ${safeSubject} constructed initial hypotheses that established the foundational lexicon and experimental standards we rely on today.`,
      bulletPoints: [],
      speakerNotes: `Detail the historical genesis of ${safeTopic}. Note how intellectual breakthroughs overcame long-standing dogmas in the field.`,
      suggestedVisualOrDiagram: `Evolutionary historical timeline marking key researchers, eras, and conceptual paradigm shifts.`,
      discussionOrEngagementPrompt: `How did early historical debates lay the groundwork for modern consensus on ${safeTopic}?`
    },
    {
      id: 's-3',
      slideNumber: 3,
      slideType: 'concept',
      title: `THEORETICAL FOUNDATION & AXIOMS`,
      subtitle: `The Governing Laws and Mathematical/Systemic Assumptions`,
      slideContent: `At the root of ${safeTopic} lie foundational axioms that govern component behaviors and constrain system outcomes. Rigorous mastery of these theoretical axioms provides the baseline necessary to predict, model, and evaluate complex interactions across ${safeSubject}.`,
      bulletPoints: [],
      speakerNotes: `Focus on the exact theoretical axioms. Demonstrate how higher-order behaviors derive logically from these primary principles.`,
      suggestedVisualOrDiagram: `Conceptual schematic mapping fundamental theoretical axioms to observable physical/analytical behaviors.`,
      discussionOrEngagementPrompt: `Which primary assumption in ${safeTopic} must hold true for the theoretical model to function?`
    },
    {
      id: 's-4',
      slideNumber: 4,
      slideType: 'concept',
      title: `OPERATIONAL MECHANISMS & WORKFLOWS`,
      subtitle: `Dynamic Component Interactions and Cause-and-Effect Sequences`,
      slideContent: `The operational framework of ${safeTopic} functions through interacting components, state transitions, and continuous feedback mechanisms. Analyzing these internal dynamics enables practitioners to track inputs, monitor transformations, and optimize performance benchmarks.`,
      bulletPoints: [],
      speakerNotes: `Guide learners through the step-by-step mechanism workflow. Highlight how changes in one subsystem propagate through the whole.`,
      suggestedVisualOrDiagram: `Dynamic multi-stage workflow flowchart displaying inputs, catalyst stages, transformations, and outputs.`,
      discussionOrEngagementPrompt: `Where in the operational workflow of ${safeTopic} is the system most sensitive to external disruption?`
    },
    {
      id: 's-5',
      slideNumber: 5,
      slideType: 'concept',
      title: `KEY DEVELOPMENTS & BREAKTHROUGHS`,
      subtitle: `Major Discovery Leaps and Experimental Paradigm Shifts`,
      slideContent: `Pivotal technological and theoretical breakthroughs fundamentally transformed our grasp of ${safeTopic}. By introducing higher precision measurement and advanced diagnostic methodologies, scientists converted longstanding anomalies into predictable principles.`,
      bulletPoints: [],
      speakerNotes: `Highlight the catalytic experiments that altered the trajectory of ${safeTopic}. Discuss how instrumentation advancements enabled new discoveries.`,
      suggestedVisualOrDiagram: `Breakthrough milestone chart comparing classic limitations with modern diagnostic precision.`,
      discussionOrEngagementPrompt: `How did modern technological tools revolutionize our empirical verification of ${safeTopic}?`
    },
    {
      id: 's-6',
      slideNumber: 6,
      slideType: 'case-study',
      title: `CASE STUDY I: BASELINE EVIDENCE`,
      subtitle: `Empirical Lab Verification and Controlled Case Findings`,
      slideContent: `Controlled empirical investigations provide undeniable proof of the principles governing ${safeTopic}. In laboratory and field trials, researchers verified quantitative models against measurable physical realities, documenting robust correlation and causal validity.`,
      bulletPoints: [],
      speakerNotes: `Review the methodology of the primary baseline case study. Discuss sample selection, control groups, and statistical significance.`,
      suggestedVisualOrDiagram: `Experimental data visualization showing control versus experimental cohorts under standardized conditions.`,
      discussionOrEngagementPrompt: `What makes the empirical data in this baseline case study convincing and reproducible?`
    },
    {
      id: 's-7',
      slideNumber: 7,
      slideType: 'case-study',
      title: `CASE STUDY II: REGIONAL CONTEXTS`,
      subtitle: `Adapting Principles Across Diverse African Environments`,
      slideContent: `Applying ${safeTopic} in authentic African and global environments highlights the vital role of contextual adaptation. Field teams tailored theoretical guidelines to account for local resources, cultural dynamics, and infrastructure realities, achieving sustainable success.`,
      bulletPoints: [],
      speakerNotes: `Discuss real-world contextualization in African settings. Emphasize why direct theoretical copy-pasting fails without contextual calibration.`,
      suggestedVisualOrDiagram: `Comparative field adaptation matrix detailing local environmental challenges and corresponding design modifications.`,
      discussionOrEngagementPrompt: `Why must universal scientific principles of ${safeTopic} be calibrated to local operational environments?`
    },
    {
      id: 's-8',
      slideNumber: 8,
      slideType: 'concept',
      title: `ANALYTICAL MODELING & PROBLEM-SOLVING`,
      subtitle: `Step-by-Step Mathematical Formulation and Diagnostic Protocols`,
      slideContent: `Translating theory into problem-solving capability requires mastering structured diagnostic algorithms for ${safeTopic}. Practitioners isolate unknown variables, apply governing formulas, evaluate boundary conditions, and test outputs for empirical plausibility.`,
      bulletPoints: [],
      speakerNotes: `Demonstrate problem-solving on a sample problem. Emphasize the self-check protocol for validating whether a solution makes physical sense.`,
      suggestedVisualOrDiagram: `Algorithmic problem-solving decision tree with branch checkpoints for error detection and correction.`,
      discussionOrEngagementPrompt: `What analytical test can you run to verify whether your calculated result for ${safeTopic} is physically plausible?`
    },
    {
      id: 's-9',
      slideNumber: 9,
      slideType: 'concept',
      title: `NUANCES & COMMON MISCONCEPTIONS`,
      subtitle: `Debunking Persistent Errors and Boundary Limitations`,
      slideContent: `Novice students frequently fall into traps regarding ${safeTopic}, such as assuming linear relationships where exponential thresholds govern. Addressing these nuances equips learners to analyze real-world exceptions and maintain rigorous analytical integrity.`,
      bulletPoints: [],
      speakerNotes: `Deconstruct the most pervasive misconceptions about ${safeTopic}. Challenge students with edge cases that refute superficial thinking.`,
      suggestedVisualOrDiagram: `Side-by-side diagnostic table contrasting flawed intuitive assumptions against rigorous empirical reality.`,
      discussionOrEngagementPrompt: `Why is the assumption of linearity so hazardous when calculating behaviors in ${safeTopic}?`
    },
    {
      id: 's-10',
      slideNumber: 10,
      slideType: 'concept',
      title: `CROSS-DISCIPLINARY SYNTHESIS`,
      subtitle: `Intersections with Other Scientific and Social Disciplines`,
      slideContent: `${safeTopic} does not exist in isolation; it interfaces directly with economics, engineering, environmental science, and ethics. Examining these interdisciplinary links enriches our perspective and uncovers creative solutions to systemic global problems.`,
      bulletPoints: [],
      speakerNotes: `Highlight how ${safeTopic} bridges ${safeSubject} with adjacent fields. Encourage students to identify multidisciplinary applications.`,
      suggestedVisualOrDiagram: `Venn diagram and network map illustrating interdisciplinary connections between ${safeTopic} and external fields.`,
      discussionOrEngagementPrompt: `Which neighboring discipline provides the most valuable collaborative insight into ${safeTopic}?`
    },
    {
      id: 's-11',
      slideNumber: 11,
      slideType: 'concept',
      title: `CONTEMPORARY INNOVATIONS & TOOLS`,
      subtitle: `Emerging Digital Technologies and Modern Field Equipment`,
      slideContent: `The integration of sensor technologies, artificial intelligence, and automated analytics is reshaping ${safeTopic}. Modern tools allow real-time diagnostic telemetry, predictive failure analysis, and unprecedented experimental scalability across ${safeSubject}.`,
      bulletPoints: [],
      speakerNotes: `Survey state-of-the-art technologies modern researchers use to study ${safeTopic}. Discuss how digital workflows democratize research access.`,
      suggestedVisualOrDiagram: `Technological architecture diagram highlighting sensor inputs, cloud processing, and automated output metrics.`,
      discussionOrEngagementPrompt: `How will AI and automated sensing reshape experimental research in ${safeTopic} over the next five years?`
    },
    {
      id: 's-12',
      slideNumber: 12,
      slideType: 'concept',
      title: `CONSTRAINTS & RISK MANAGEMENT`,
      subtitle: `Navigating Ethical Considerations and Practical Limitations`,
      slideContent: `Responsible stewardship of ${safeTopic} necessitates proactive risk mitigation and adherence to ethical mandates. Addressing potential hazards, environmental trade-offs, and resource disparities ensures technological applications deliver just, equitable benefits.`,
      bulletPoints: [],
      speakerNotes: `Facilitate a thoughtful discussion on ethical considerations and resource limitations in deploying ${safeTopic} at scale.`,
      suggestedVisualOrDiagram: `Risk assessment matrix categorizing probability and severity of potential operational pitfalls and remedies.`,
      discussionOrEngagementPrompt: `What ethical responsibilities do scholars and engineers carry when deploying technologies derived from ${safeTopic}?`
    },
    {
      id: 's-13',
      slideNumber: 13,
      slideType: 'concept',
      title: `STRATEGIC METHODOLOGIES & SOLUTIONS`,
      subtitle: `Scalable Implementation Frameworks for Classroom & Industry`,
      slideContent: `Translating insights from ${safeTopic} into sustainable impact requires scalable roadmaps, stakeholder alignment, and continuous quality audits. Building resilient systems guarantees long-term viability even amid shifting socioeconomic and environmental conditions.`,
      bulletPoints: [],
      speakerNotes: `Present the strategic implementation roadmap. Emphasize the importance of community ownership and feedback loops.`,
      suggestedVisualOrDiagram: `Strategic execution roadmap displaying phased milestone targets, accountability gates, and KPI reviews.`,
      discussionOrEngagementPrompt: `What governance strategy ensures that implementations of ${safeTopic} remain resilient over time?`
    },
    {
      id: 's-14',
      slideNumber: 14,
      slideType: 'concept',
      title: `KEY TAKEAWAYS & ACTIONABLE MASTERY`,
      subtitle: `Consolidating Core Competencies and Foundational Insights`,
      slideContent: `Throughout this master exploration, we have mapped ${safeTopic} from its historical genesis through theoretical mechanics, empirical evidence, and modern innovations. Retaining these core principles provides a versatile conceptual framework for lifelong achievement.`,
      bulletPoints: [],
      speakerNotes: `Reiterate the overarching learning outcomes. Test student mastery with quick-fire synthesis questions across the 15 topics.`,
      suggestedVisualOrDiagram: `Master competencies scorecard outlining the primary analytical and practical capabilities achieved today.`,
      discussionOrEngagementPrompt: `Which analytical skill gained from this study of ${safeTopic} will be most valuable in your future academic journey?`
    },
    {
      id: 's-15',
      slideNumber: 15,
      slideType: 'summary',
      title: `CONCLUSION & HORIZON HORIZONS`,
      subtitle: `Enduring Legacy, Uncharted Questions, and Future Leadership`,
      slideContent: `As our exploration concludes, ${safeTopic} beckons learners toward unexplored frontiers and meaningful real-world contribution. By applying these lessons with curiosity, rigor, and purpose, students are prepared to pioneer transformative change across ${safeSubject}.`,
      bulletPoints: [],
      speakerNotes: `Deliver closing remarks. Congratulate learners on completing this rigorous 15-slide master curriculum and outline next steps.`,
      suggestedVisualOrDiagram: `Visionary future horizon graphic depicting collaborative innovation opportunities for emerging leaders in ${safeSubject}.`,
      discussionOrEngagementPrompt: `What legacy do you hope to build through your continued study and practical application of ${safeTopic}?`
    }
  ];
}
