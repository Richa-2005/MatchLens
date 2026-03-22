import { useState,useEffect } from 'react';
import api from '@/api/axiosClient';
import AppShell from '@/components/AppShell';
import ResumeModal from './modals/ResumeModal';
import ResumeCard from './modals/ResumeCard';
import ResumeEditor from '@/components/forms/ResumeEditor';

type ResumesResponse = {
    id: string,
    title: string,
    tags: string[],
    createdAt: string,
    updatedAt: string
}

type ResumeResponse = ResumesResponse & {
    rawText: string
}

type SortingVal = "Newest" | "Oldest";

type AnalysisInput = {
  title: string;
  rawText: string;
};

export default function Resume() {
    const [resumes, setResumes] = useState<ResumesResponse[]>([]);
    const [resume,setResume] = useState<ResumeResponse | null>(null);
    const [loading,setLoading] = useState<boolean>(false);
    const [error,setError] = useState<string>("");

    const [search,setSearch] = useState<string>("");
    const [sort,setSort] = useState<SortingVal>("Newest");

    //new Resume
    const [newResume, setNewResume] = useState<AnalysisInput>({ title: "", rawText: "" });
    const [isSubmitting,setSubmitting] = useState<boolean>(false);

    //filter function
    const filterResumes = (items: ResumesResponse[], searchValue: string) => {
        return items.filter((item) =>
            item.title.toLowerCase().includes(searchValue.toLowerCase())
    );
    };

    //sort function
    const sortResumes = (items: ResumesResponse[], sortValue: SortingVal) => {
        const sorted = [...items];

        sorted.sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();

            return sortValue === "Newest" ? bTime - aTime : aTime - bTime;
        });

        return sorted;
    };

    const fetchResumes = async () => {
            setError('');
            setLoading(true);

            try {
                const response = await api.get('/resumes');

                setResumes(response.data);
                
            } catch (error) {
                setError("Failed to load your resumes. Please try again later.");

            } finally {
                setLoading(false);
            }
    };

    useEffect(() => {
        fetchResumes();
    }, []);


    const openResume = async(id: string) =>{
        setError('');
        setLoading(true);
        
        try{
            const resume = await api.get(`/resumes/${id}`);
            setResume(resume.data);
        }catch(error){
            setError('Failed to fetch this resume.');;
        }finally{
            setLoading(false);
        }
    }

    const deleteResume = async(id: string) =>{
        setError('');
        setLoading(true);
        
        try{
            await api.delete(`/resumes/${id}`);
            setResume(null);
            await fetchResumes();
        }catch(error){
            setError('Failed to delete this resume.');;
        }finally{
            setLoading(false);
        }
    }

    const displayedResumes = sortResumes(
        filterResumes(resumes, search),
        sort
    );

    const saveResume = async(e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        setSubmitting(true);

        try {
            if (
                newResume.title.trim().length === 0 ||
                newResume.rawText.trim().length === 0 
            ){
                setError("Please fill all fields for Resume.");
                setSubmitting(false);
                return;
            }
        
            await api.post("/resumes", newResume);
            setNewResume({ title: "", rawText: "" });
            await fetchResumes();
        } catch (error) {
            setError("Failed to save. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    }

    


  return (
   
        <AppShell 
            title = "Resumes"
            subtitle="Manage and edit your saved resumes"
        >

            {/* Creating a new resume */}
            {!resume &&
            <ResumeEditor 
                badge="Resume Library"
                titleText="Create New Resume"
                description="Save a resume now and reuse it later for analysis."
                submitLabel="Save Resume"
                submittingLabel="Saving..."
                title={newResume.title}
                rawText={newResume.rawText}
                setFormData={setNewResume}
                onSubmit={saveResume}
                isSubmitting={isSubmitting}

            />
            }

            {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-sm text-slate-400">Loading...</div>
            )}
            
            {!loading && resume && 
                <ResumeModal 
                    setResume={setResume} 
                    deleteResume={deleteResume}
                    resume = {resume}
                />
            }
                
                {!loading && !resume && (
                    <div className="space-y-4">
                        
                        <div className="flex flex-wrap gap-3">
                            <input
                                type="text"
                                placeholder="Search by title..."
                                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                                value = {search}
                                onChange={e=>setSearch(e.target.value)}
                            />

                            <select 
                                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                                onChange={e => {
                                    const val:unknown = e.target.value;
                                    const value = val as SortingVal;
                                    setSort(value)
                                }}
                                value={sort}
                            >
                                <option value="Newest" >Newest</option>
                                <option value="Oldest">Oldest</option>
                            </select>
                        </div>

                        
                        {displayedResumes.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-6 py-10 text-center">
                            <p className="text-sm text-slate-400">
                                No resumes yet. Create your first one.
                            </p>
                        </div>
                        )}
                        
                        <ResumeCard 
                            displayedResumes={displayedResumes} 
                            openResume={openResume}
                        />

                    </div>
                    )}

        </AppShell>
 
  )
}
