import React, { useState } from 'react';

const Goals = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financial Goals</h1>
          <p className="text-slate-500">Track your progress toward big milestones.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
          + New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Goal Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Emergency Fund</h3>
          <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-[45%]"></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-slate-500 font-medium">$4,500 saved</span>
            <span className="text-indigo-600 font-bold">45%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// THE FINAL MISSING EXPORT:
export default Goals;