"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  OrderByDirection,
} from "firebase/firestore";

// Define JobPost and Application types
type JobPost = {
  id: string;
  title: string;
  description: string;
  datePosted: string;
};

type Application = {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  dateApplied: string;
};

export default function StudentDashboard({ studentId }: { studentId: string }) {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sortOrder, setSortOrder] = useState<OrderByDirection>("asc");
  const [activeTab, setActiveTab] = useState("jobPosts");

  useEffect(() => {
    fetchJobPosts();
    fetchApplications();
  }, [sortOrder]);

  const fetchJobPosts = async () => {
    const jobsQuery = query(
      collection(db, "jobPosts"),
      orderBy("datePosted", sortOrder)
    );
    const snapshot = await getDocs(jobsQuery);
    setJobPosts(
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobPost))
    );
  };

  const fetchApplications = async () => {
    const applicationsQuery = query(
      collection(db, "applications"),
      where("studentId", "==", studentId)
    );
    const snapshot = await getDocs(applicationsQuery);
    setApplications(
      snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Application)
      )
    );
  };

  const applyForJob = async (jobId: string) => {
    const existingApplication = applications.find(
      (app) => app.jobId === jobId
    );
    if (existingApplication) {
      alert("You have already applied for this job!");
      return;
    }
    await addDoc(collection(db, "applications"), {
      studentId,
      jobId,
      status: "pending",
      dateApplied: new Date().toISOString(),
    });
    fetchApplications();
    alert("Application submitted!");
  };

  const getStatus = (jobId: string) => {
    const application = applications.find((app) => app.jobId === jobId);
    return application ? application.status : "Not Applied";
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-blue-50 to-indigo-50 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Student Dashboard</h1>
      </header>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-6 py-3 font-semibold text-lg rounded-md shadow-md transition-all ${
              activeTab === "jobPosts"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-800"
            } hover:bg-blue-500`}
            onClick={() => setActiveTab("jobPosts")}
          >
            Job Posts
          </button>
          <button
            className={`px-6 py-3 font-semibold text-lg rounded-md shadow-md transition-all ${
              activeTab === "applicationStatus"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-800"
            } hover:bg-blue-500`}
            onClick={() => setActiveTab("applicationStatus")}
          >
            Application Status
          </button>
        </div>
      </div>

      {activeTab === "jobPosts" && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Available Job Postings</h2>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as OrderByDirection)}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-md shadow-md focus:ring-2 focus:ring-blue-400"
            >
              <option value="asc">Sort by Date (Oldest)</option>
              <option value="desc">Sort by Date (Newest)</option>
            </select>
          </div>

          {jobPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobPosts.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Posted on: {new Date(job.datePosted).toLocaleDateString()}
                  </p>
                  <button
                    className={`w-full px-4 py-2 rounded-md font-semibold text-white ${
                      getStatus(job.id) === "Not Applied"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } transition-all`}
                    onClick={() => applyForJob(job.id)}
                    disabled={getStatus(job.id) !== "Not Applied"}
                  >
                    {getStatus(job.id) === "Not Applied"
                      ? "Apply Now"
                      : "Application Submitted"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No job postings available.</p>
          )}
        </section>
      )}

      {activeTab === "applicationStatus" && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Application Status
          </h2>
          {applications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {applications.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Job ID: {app.jobId}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Applied on: {new Date(app.dateApplied).toLocaleDateString()}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      app.status === "pending"
                        ? "text-yellow-500"
                        : app.status === "accepted"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No applications found.</p>
          )}
        </section>
      )}
    </div>
  );
}
