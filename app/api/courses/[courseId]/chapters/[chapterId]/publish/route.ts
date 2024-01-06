import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function PATCH(
    req:Request,
    {params}: {params:{courseId: string; chapterId:string}}
){
    try {
        const {userId} = auth();

        if(!userId){
            return new NextResponse("Unauthorized", {status: 401});
        }

        const courseOwner = await db.course.findUnique({
            where:{
                id: params.courseId,
                userId
            }
        });
        if(!courseOwner){
            return new NextResponse("Unathorized", {status:401});
        }

        const chapter = await db.chapter.findUnique({
            where:{
                id: params.chapterId
            }
        })

        const muxdata = await db.muxData.findUnique({
            where:{
                chapterId: params.chapterId
            }
        });

        if(!chapter || !muxdata || !chapter.title || !chapter.videoUrl || !chapter.description){
            return new NextResponse("missing required fields", {status:400});
        }

        const publishchapter = await db.chapter.update({
            where:{
                id:params.chapterId,
                courseId:params.courseId
            },
            data:{
                isPublished:true
            }
        });

        return NextResponse.json(publishchapter);
    } catch (error) {
        console.log("PUBLISH_CHAPTER_ID", error);
        return new NextResponse("Internal Error", {status: 500});
    }
}
