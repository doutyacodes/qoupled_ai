"use client"
import React from 'react';
import Compatibility from './Compatibility'; // Adjust the path if necessary
// import Question from './Question'; // Adjust the path if necessary
// import { Navbar } from '@/app/components/section/Navbar';
import PersonalityQuestion from './personality-question';
import PreferenceQuestion from './preference-question';
import ModernNavbar from '@/app/_components/Navbar';



const Tests = () => {
  // const [showResult, setShowResult] = useState(false);

  // // Simulate when the result is ready (e.g., after completing the test)
  // const handleShowResult = () => {
  //   setShowResult(true); // Set true when ready to show result
  // };

  return (
    <div>
       {/* <ModernNavbar /> */}
      <Compatibility />
      {/* <PersonalityQuestion />  */}
      {/* <PreferenceQuestion /> */}
    </div> 
  );
};

export default Tests;
