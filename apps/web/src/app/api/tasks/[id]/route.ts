import { db } from '@tasker/database';
import { parse } from 'date-fns';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { status, title, dueAt, description, assigneeId, projectId } =
    await req.json();
  const task = await db.task.update({
    where: { id: parseInt(params.id) },
    data: {
      status,
      title,
      description,
      projectId: parseInt(projectId),
      dueAt: dueAt ? parse(dueAt, 'yyyy-MM-dd', new Date()) : undefined,
    },
    include: {
      AssigneesOnTasks: true,
    },
  });
  if (task.AssigneesOnTasks[0]) {
    await db.assigneesOnTasks.delete({
      where: {
        taskId_assigneeId: {
          taskId: task.id,
          assigneeId: task.AssigneesOnTasks[0].assigneeId,
        },
      },
    });
  }
  if (assigneeId) {
    await db.assigneesOnTasks.create({
      data: {
        taskId: task.id,
        assigneeId: assigneeId,
      },
    });
  }
  return NextResponse.json(task);
}
