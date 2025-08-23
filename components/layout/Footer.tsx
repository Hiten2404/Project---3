
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">GovJobAlert</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Your trusted source for government job opportunities in India.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Quick Links</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Categories</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:underline">Banking Jobs</a></li>
              <li><a href="#" className="hover:underline">Teaching Jobs</a></li>
              <li><a href="#" className="hover:underline">Defense Jobs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Follow Us</h3>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Twitter</a>
              <a href="#" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Facebook</a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} GovJobAlert. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
