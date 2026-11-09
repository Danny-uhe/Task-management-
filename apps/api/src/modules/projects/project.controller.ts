import { Request, Response } from "express";

import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
} from "./project.validation.js";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  getEligibleProjectMembers,
  addProjectMember,
} from "./project.service.js";



export async function create(
    req: Request,
    res: Response
) {
    try {
        const body = createProjectSchema.parse(req.body);

        const project = await createProject(
            body,
            req.user!.userId
        );

        return res.status(201).json({
            success: true,
            project,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Something went wrong",
        });
    }
}

export async function getAll(req: Request, res: Response) {
    try {
      const projects = await getProjects(req.user!.userId);
  
      res.json({
        success: true,
        projects,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }


  export async function getOne(req: Request, res: Response) {
    try {
      const project = await getProjectById(
        req.params.id as string,
        req.user!.userId
      );
  
      return res.json({
        success: true,
        project,
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }


  export async function update(req: Request, res: Response) {
    try {
      const body = updateProjectSchema.parse(req.body);

      const project = await updateProject(
        req.params.id as string,
        req.user!.userId,
        body
      );

      return res.json({
        success: true,
        project,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }

  export async function remove(
    req: Request,
    res: Response
  ) {
    try {
      await deleteProject(
        req.params.id as string,
        req.user!.userId
      );
  
      return res.json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }


  export async function getMembers(
    req: Request,
    res: Response
  ) {
    try {
      const members = await getProjectMembers(req.params.id as string);
  
      return res.json({
        success: true,
        members,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  export async function getEligibleMembers(
    req: Request,
    res: Response
  ) {
    try {
      const members = await getEligibleProjectMembers(
        req.params.id as string,
        req.user!.userId
      );

      return res.json({
        success: true,
        members,
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  export async function addMember(
    req: Request,
    res: Response
  ) {
    try {
      const body = addProjectMemberSchema.parse(req.body);

      const member = await addProjectMember(
        req.params.id as string,
        req.user!.userId,
        body.userId,
        body.role
      );
      return res.status(201).json({
        success: true,
        member,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }