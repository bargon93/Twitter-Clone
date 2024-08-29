import {toast} from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useFollow = () => {
      const queryClient = useQueryClient();

      const {mutate:follow, isPending} = useMutation({
            mutationFn: async (userID) => {
                  try {
                        const res = await fetch(`/api/users/follow/${userID}`, {
                              method: "POST",
                        })
                        const data = res.json();
                        if(!res.ok) throw new Error(data.error || "Something went wrong");
                        return data;
                  } catch (error) {
                        throw new Error(error);
                  }
            },
            onSuccess: () => {
                  //make sure the queryClient will run in parallel
                  Promise.all([
                        queryClient.invalidateQueries({queryKey: ["suggested"]}),
                        queryClient.invalidateQueries({queryKey: ["authUser"]})
                  ]);
            },
            onError: (error) => {
                  toast.error(error.message);
            }
      });

      return {follow, isPending};
}

export default useFollow;