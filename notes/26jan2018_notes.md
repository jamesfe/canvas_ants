# Notes


From an earlier day:
```
What is faster? all gMap or all canvas?
I think it's certainly faster to read the gMap
It may also be faster to draw from the gMap

What do we need to do to make the migration?
1. We need a way to tranform gmap -> image and image -> gmap
2. We have to have a function to read the initial image and turn it into a gmap
3. We must draw the gmap
4. We have to transform our "read to temp context" functions too


What is the flow?
1. Get the current state of the gMap
2. For each ant, plot your move and then un-plot the previous position
3. At the end, from the gMap we will draw the canvas
```

But my current thinking is this: 
1. We don't have to be hugely scalable (really just 800x800)
2. We can create a list and some presence identifiers
3. Keep everything in arrays and draw it as we see fit (walls included)
4. We should keep a presence matrix for fun.
