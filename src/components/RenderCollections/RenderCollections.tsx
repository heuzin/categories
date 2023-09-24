import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RenderCollectionsProps } from "./RenderCollectionsProps";
import { useMediaQuery, useTheme } from "@mui/material";

import Grid from "@mui/material/Grid";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";

import { useAppSelector } from "@/app/redux/hooks";

const RenderCollections: React.FC<RenderCollectionsProps> = ({
  data,
  path,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const mdSize = useMediaQuery(theme.breakpoints.down("md"));
  const { open } = useAppSelector((state) => state.drawer);

  const getImageSize = () => (mdSize ? "250px" : "300px");

  return (
    <ImageList
      gap={30}
      cols={mdSize ? 1 : 2}
      sx={{ justifyItems: "center", height: getImageSize() }}
    >
      {(data || []).map((collection) => (
        <Grid
          height={getImageSize()}
          item
          xs={12}
          width={"100%"}
          key={collection.image}
          sx={{ overflow: "hidden" }}
        >
          <ImageListItem
            style={{ height: getImageSize() }}
            sx={{
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              collection.collectionsId
                ? router.push(
                    `/${path}/${collection.collectionsId}/${collection.id}`
                  )
                : router.push(`/${path}/${collection.id}`);
            }}
          >
            <Image
              alt={collection.title}
              width={0}
              height={0}
              loading="lazy"
              sizes="100vw"
              src={`${collection.image}`}
              style={{
                overflow: "hidden",
                width: "100%",
                height: "auto",
                objectFit: "cover",
              }}
            />
            {!open && mdSize && <ImageListItemBar title={collection.title} />}
            {!mdSize && <ImageListItemBar title={collection.title} />}
          </ImageListItem>
        </Grid>
      ))}
    </ImageList>
  );
};

export default RenderCollections;
