import FocusTrap from 'focus-trap-react';
import { useAppContext } from '../../context/useAppContext';
import toast from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/clerk-react';
import { mapResumeToState } from '../../utils/helper';

const DeleteModal = ({ showDeleteModal, setShowDeleteModal }) => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const { currResume, setCurrResume, allResumes, setAllResumes } =
    useAppContext();

  const deleteResume = async () => {
    if (!isSignedIn || !user || !currResume) return;

    try {
      const token = await getToken();

      const res = await fetch(`/api/users/resumes/${currResume.resumeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 200) {
        toast.success('Resume deleted successfully!', {
          duration: 2000,
        });
      } else {
        toast.error(data?.message || 'Failed to delete resume');
      }

      const updatedResumes = allResumes.filter(
        (resume) => resume.id !== currResume.resumeId,
      );

      setAllResumes(updatedResumes);

      if (updatedResumes.length > 0) {
        const nextResume = updatedResumes[0];
        const mapped = mapResumeToState(nextResume);
        setCurrResume(mapped);
        setShowDeleteModal(false);
      } else {
        setCurrResume(blankResume);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowDeleteModal(false)}
      />
      {/* Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <FocusTrap>
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Resume
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete this resume? This action cannot
                be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={deleteResume}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}
    </div>
  );
};

export default DeleteModal;
