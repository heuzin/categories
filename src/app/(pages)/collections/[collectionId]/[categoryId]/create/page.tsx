"use client";
import { CategoryItems } from "@prisma/client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery, useTheme } from "@mui/material";
import "react-dropzone/examples/theme.css";

import Grid from "@mui/material/Grid";
import LinearStepper from "@/components/LinearStepper/LinnearStepper";

import { useAppDispatch } from "@/app/redux/hooks";
import { errorSnackbar } from "@/app/redux/features/snackbarSlice";
import { useUploadImageMutation } from "@/app/redux/services/imageApiSlice";
import {
  useCreateCategoryItemMutation,
  useGetCategoryItemQuery,
} from "@/app/redux/services/categoryItemApiSlice";

import Review from "./Review";
import AddVideo from "./AddVideo";
import AddIcons from "./AddIcons";
import AddRating from "./AddRating";
import AddDetails from "./AddDetails";
import SelectImage from "./SelectImage";
import AdditionalInformations, { getItemIndex } from "./AdditionalInformations";
import ProgressMobileStepper from "@/components/MobileStepper/ProgressMobileStepper";
import BackButton from "@/components/BackButton/BackButton";

const steps = [
  "Details",
  "Additional informations",
  "Icons",
  "Image",
  "Video",
  "Rating",
  "Review",
];

interface CreateCategoryItemPageProps {
  params: { categoryId: string; collectionId: string };
}

const CreateCategoryItemPage: React.FC<CreateCategoryItemPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const lgSize = useMediaQuery(theme.breakpoints.down("lg"));
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const collectionId = params.collectionId;
  const categoryId = params.categoryId;
  const categoryItemId = searchParams.get("categoryItemId");
  const { data: queryData, isLoading } = useGetCategoryItemQuery({
    collectionId,
    categoryId,
    categoryItemId,
  });
  const [uploadImage] = useUploadImageMutation();
  const [createCategoryItem] = useCreateCategoryItemMutation();

  const [file, setFile] = useState<string>("");
  const [activeStep, setActiveStep] = React.useState(0);

  const [left, setLeft] = React.useState<readonly number[]>([0, 1, 2, 3]);
  const [right, setRight] = React.useState<readonly number[]>([]);

  const [data, setData] = useState<Partial<CategoryItems>>({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    video: "",
    icons: [],
    comments: [],
    details: {},
    rating: {
      quality: 0,
      expectations: 0,
      performance: 0,
      recommendation: 0,
      overall: 0,
      total: 0,
    },
  });
  const [filesToUpload, setFileToUpadload] = useState<any>("");

  const getItems = useCallback(async () => {
    if (isLoading) return;

    setData({
      title: queryData?.title ?? "",
      subtitle: queryData?.subtitle ?? "",
      description: queryData?.description ?? "",
      image: queryData?.image ?? "",
      video: queryData?.video ?? "",
      icons: queryData?.icons ?? [],
      comments: queryData?.comments ?? [],
      details: queryData?.details ?? {},
      rating: queryData?.rating ?? {
        quality: 0,
        expectations: 0,
        performance: 0,
        recommendation: 0,
        overall: 0,
        total: 0,
      },
    });
    if (queryData?.details) {
      const newRight: number[] = [];
      Object.keys(queryData?.details).forEach((detail: string) => {
        newRight.push(getItemIndex(detail));
      });
      const newLeft = left.filter((item) => !newRight.includes(item));

      setRight(newRight);
      setLeft(newLeft);
    }
    setFile(queryData?.image ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    getItems();
  }, [getItems]);

  const handleCreate = async () => {
    try {
      let imageURL;
      if (filesToUpload) {
        const { url } = await uploadImage(filesToUpload).unwrap();
        imageURL = url.split("?")[0];
      } else {
        imageURL = data.image;
      }

      const createdItem = await createCategoryItem({
        collectionId,
        categoryId,
        categoryItemId,
        item: {
          ...data,
          image: imageURL,
          categoryId,
        },
      }).unwrap();

      router.push(
        `/collections/${collectionId}/${categoryId}/${createdItem.id}`
      );
    } catch (error) {
      dispatch(errorSnackbar({ message: "Failed to upload image" }));
    }
  };

  const getStep = () => {
    switch (activeStep) {
      case 0:
        return <AddDetails data={data} setData={setData} />;
      case 1:
        return (
          <AdditionalInformations
            data={data}
            left={left}
            right={right}
            setLeft={setLeft}
            setRight={setRight}
            setData={setData}
          />
        );
      case 2:
        return <AddIcons data={data} setData={setData} />;
      case 3:
        return (
          <SelectImage
            file={file}
            setData={setData}
            setFile={setFile}
            setFileToUpadload={setFileToUpadload}
          />
        );
      case 4:
        return <AddVideo data={data} setData={setData} />;
      case 5:
        return <AddRating data={data} setData={setData} />;
      case 6:
        return <Review data={data} setData={setData} />;
      default:
        return null;
    }
  };

  const checkRequired = () => {
    const { title, subtitle, description } = data;
    switch (activeStep) {
      case 0:
        if (!title || !subtitle || !description) {
          dispatch(
            errorSnackbar({ message: "Please fill all required informations" })
          );
          return false;
        }
        return true;

      case 3:
        if (!file) {
          dispatch(errorSnackbar({ message: "Please select an image" }));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  return (
    <>
      <BackButton path={`/collections/${collectionId}/${categoryId}`} />
      <Grid container mt={4} justifyContent={"center"}>
        <Grid item xs={lgSize ? 12 : 10}>
          {lgSize ? (
            <>
              {" "}
              <ProgressMobileStepper
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                checkRequired={checkRequired}
                handleCreate={handleCreate}
              />{" "}
              {getStep()}
            </>
          ) : (
            <LinearStepper
              steps={steps}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              checkRequired={checkRequired}
              handleCreate={handleCreate}
            >
              {getStep()}
            </LinearStepper>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default CreateCategoryItemPage;
