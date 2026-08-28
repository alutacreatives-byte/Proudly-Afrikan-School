import React, { useState, useEffect } from 'react';
import { MasterHeader, MainNavTab } from './components/MasterHeader';
import StudyApp from './study/App';
import QuizApp from './quiz/App';
import BuildApp from './build/App';
import { MySetsWorkspace } from './mysets/MySetsWorkspace';
import { CentralPlannerView } from './planner/CentralPlannerView';
import { StudySet, AppView as StudyAppView } from './study/types';
import { Quiz } from './quiz/types';
import { SavedResource, ToolType } from './build/types';
import { StorageService } from './study/services/storageService';
import { getSavedResources } from './build/utils/storage';
import { getRecentQuizzes } from './quiz/utils/quizShare';
import { StudyTutorModal } from './study/components/StudyTutorModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('STUDY');

  // Cross-Platform Active Content State
  const [selectedStudySet, setSelectedStudySet] = useState<StudySet | null>(null);
  const [studyInitialView, setStudyInitialView] = useState<StudyAppView>('home');
  
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  const [selectedBuildTool, setSelectedBuildTool] = useState<ToolType | null>(null);
  const [selectedBuildResource, setSelectedBuildResource] = useState<SavedResource | null>(null);

  // Global AI Tutor Modal
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [tutorMode, setTutorMode] = useState<'tutor' | 'homework'>('tutor');

  // Total saved items count for badge
  const [totalSavedCount, setTotalSavedCount] = useState<number>(0);

  const calculateSavedCount = () => {
    try {
      const sets = StorageService.getAllStudySets().length;
      const quizzes = getRecentQuizzes().length;
      const buildResources = getSavedResources().length;
      setTotalSavedCount(sets + quizzes + buildResources);
    } catch (e) {
      setTotalSavedCount(0);
    }
  };

  useEffect(() => {
    calculateSavedCount();
  }, [activeTab]);

  // Check URL parameters for direct shared links (e.g. ?quiz=... or ?tab=quiz)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('quiz')) {
        setActiveTab('QUIZ');
      } else if (params.get('tab')) {
        const tab = params.get('tab')?.toUpperCase();
        if (tab === 'STUDY' || tab === 'QUIZ' || tab === 'BUILD' || tab === 'MY SETS' || tab === 'PLANNER') {
          setActiveTab(tab as MainNavTab);
        }
      }
    } catch (e) {}
  }, []);

  const handleSelectTab = (tab: MainNavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch handlers from My Sets or Planner
  const handleOpenStudySetFromAnywhere = (set: StudySet, view: 'study' | 'flashcards' | 'practice' = 'study') => {
    setSelectedStudySet(set);
    if (view === 'flashcards') {
      setStudyInitialView('flashcards');
    } else if (view === 'practice') {
      setStudyInitialView('practice');
    } else {
      setStudyInitialView('set-detail');
    }
    setActiveTab('STUDY');
  };

  const handleOpenQuizFromAnywhere = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveTab('QUIZ');
  };

  const handleOpenBuildResourceFromAnywhere = (resource: SavedResource) => {
    setSelectedBuildResource(resource);
    setSelectedBuildTool(null);
    setActiveTab('BUILD');
  };

  const handleNavigateToBuildWithTool = (tool?: ToolType) => {
    setSelectedBuildTool(tool || null);
    setSelectedBuildResource(null);
    setActiveTab('BUILD');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#161616]">
      {/* Universal Top Navigation Header: STUDY · QUIZ · BUILD · MY SETS · PLANNER */}
      <MasterHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        savedItemCount={totalSavedCount}
        onOpenTutor={() => {
          setTutorMode('tutor');
          setIsTutorOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'STUDY' && (
          <StudyApp
            key={selectedStudySet ? `study-${selectedStudySet.id}-${studyInitialView}` : 'study-default'}
            initialSet={selectedStudySet}
            initialView={studyInitialView}
            onNavigateToTab={handleSelectTab}
            onOpenGlobalTutor={() => {
              setTutorMode('tutor');
              setIsTutorOpen(true);
            }}
          />
        )}

        {activeTab === 'QUIZ' && (
          <QuizApp
            key={selectedQuiz ? `quiz-${selectedQuiz.id}` : 'quiz-default'}
            initialQuiz={selectedQuiz}
            onNavigateToTab={handleSelectTab}
          />
        )}

        {activeTab === 'BUILD' && (
          <BuildApp
            key={
              selectedBuildResource
                ? `build-res-${selectedBuildResource.id}`
                : selectedBuildTool
                ? `build-tool-${selectedBuildTool}`
                : 'build-default'
            }
            initialTool={selectedBuildTool}
            initialResource={selectedBuildResource}
            onNavigateToTab={handleSelectTab}
          />
        )}

        {activeTab === 'MY SETS' && (
          <MySetsWorkspace
            onOpenStudySet={handleOpenStudySetFromAnywhere}
            onOpenQuiz={handleOpenQuizFromAnywhere}
            onOpenBuildResource={handleOpenBuildResourceFromAnywhere}
            onNavigateToStudy={() => setActiveTab('STUDY')}
            onNavigateToQuiz={() => setActiveTab('QUIZ')}
            onNavigateToBuild={handleNavigateToBuildWithTool}
          />
        )}

        {activeTab === 'PLANNER' && (
          <CentralPlannerView
            onStartStudySet={handleOpenStudySetFromAnywhere}
            onStartQuiz={handleOpenQuizFromAnywhere}
            onExploreSets={() => setActiveTab('STUDY')}
          />
        )}
      </main>

      {/* Global AI Tutor Modal */}
      {isTutorOpen && (
        <StudyTutorModal
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          initialMode={tutorMode}
          activeSetTitle={selectedStudySet?.title}
        />
      )}
    </div>
  );
}
