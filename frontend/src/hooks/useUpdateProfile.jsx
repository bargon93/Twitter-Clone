import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useUpdateProfile = (formData) => {
      const queryClient = useQueryClient();
      const navigate = useNavigate();
      const {mutateAsync: updateProfile, isPending: isUpdatingProfile} = useMutation({
            mutationFn: async () => {
                  try {
                        console.log(formData);
                        const res = await fetch("/api/users/update", {
                              method: "POST",
                              headers: {
                                    "Content-Type" : "application/json",
                              },
                              body: JSON.stringify(formData),
                        });
                        const data = await res.json();
                        if(!res.ok) throw new Error(data.error || "Something went wrong");
                        return data;
                  } catch (error) {
                        throw new Error(error);
                  }
            },
            onSuccess: () => {
                  toast.success("Profile updated successfully");
                  Promise.all([
                        queryClient.invalidateQueries({queryKey: ["authUser"]}),
                        queryClient.invalidateQueries({queryKey: ["userProfile"]})
                  ]);
                  if(formData.username) {
                        navigate(`/profile/${formData.username}`)
                  }
            },
            onError: (error) => {
                  toast.error(error.message);
            }

      });

      return {updateProfile, isUpdatingProfile};
}

export default useUpdateProfile;